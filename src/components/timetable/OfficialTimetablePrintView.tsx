import React, { useRef } from "react";
import { 
  Printer, 
  X, 
  Award, 
  Calendar, 
  Clock, 
  Building, 
  Users, 
  ShieldCheck, 
  BookOpen 
} from "lucide-react";
import { TimetableEntry, ScheduleSlotCalculated } from "../../types";

interface OfficialTimetablePrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  printType: "class" | "teacher" | "school_matrix";
  targetName: string; // Class name, teacher name, or "École Globale"
  entries: TimetableEntry[];
  periodSlots: ScheduleSlotCalculated[];
  schoolName?: string;
  schoolMotto?: string;
  academicYear?: string;
}

export const OfficialTimetablePrintView: React.FC<OfficialTimetablePrintViewProps> = ({
  isOpen,
  onClose,
  printType,
  targetName,
  entries,
  periodSlots,
  schoolName = "COMPLEXE SCOLAIRE SMART SCHOOL RDC",
  schoolMotto = "Discipline - Travail - Excellence",
  academicYear = "2025-2026"
}) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  const handlePrint = () => {
    window.print();
  };

  const getDocTitle = () => {
    switch (printType) {
      case "class":
        return `HORAIRE DE COURS OFFICIEL • CLASSE DE ${targetName.toUpperCase()}`;
      case "teacher":
        return `FICHE DE CHARGE HORAIRE & SERVICE • ENSEIGNANT ${targetName.toUpperCase()}`;
      case "school_matrix":
        return `MATRICE SYNOPTIQUE GÉNÉRALE DES HORAIRES • ÉTABLISSEMENT`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl p-6 shadow-2xl space-y-6 my-auto max-h-[95vh] overflow-y-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-brand-blue rounded-xl">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Aperçu du Document Officiel d'Impression (EPST / RDC)
              </h3>
              <p className="text-xs text-slate-500">Format certifié pour affichage en classe, farde du professeur et babillard administratif.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Lancer l'Impression</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL DRC DOCUMENT SHEET */}
        <div 
          ref={printableRef}
          className="p-8 bg-white text-slate-950 border border-slate-300 rounded-xl shadow-md space-y-6 print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Official DRC Header */}
          <div className="border-b-2 border-slate-900 pb-4 space-y-2">
            <div className="text-center space-y-0.5">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-800">
                RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                MINISTÈRE DE L'ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETÉ (MINEPST)
              </div>
              <div className="text-[10px] font-medium text-slate-500 uppercase">
                PROVINCE ÉDUCATIONNELLE DE KINSHASA-LUKUNGA
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-left space-y-0.5">
                <div className="text-sm font-black uppercase text-slate-900">{schoolName}</div>
                <div className="text-[10px] italic text-slate-600">« {schoolMotto} »</div>
                <div className="text-[10px] font-bold text-slate-700">Code École National : 100492-EPST</div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="text-xs font-black text-slate-900">ANNÉE SCOLAIRE : {academicYear}</div>
                <div className="text-[10px] text-slate-600">Date d'édition : {new Date().toLocaleDateString("fr-FR")}</div>
                <div className="text-[9px] font-mono text-emerald-700 font-bold">● VISÉ & HOMOLOGUÉ DIRECTION</div>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-2 bg-slate-100 border border-slate-300 rounded-lg">
            <h1 className="text-sm font-black tracking-wide uppercase text-slate-900">
              {getDocTitle()}
            </h1>
          </div>

          {/* Timetable Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead>
                <tr className="bg-slate-200 border-b border-slate-900">
                  <th className="border border-slate-900 p-2 font-black uppercase text-[10px] w-28 text-center">
                    Horaire / Période
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border border-slate-900 p-2 font-black uppercase text-[10px] text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periodSlots.map((slot) => {
                  if (slot.isBreak) {
                    return (
                      <tr key={`break-${slot.index}`} className="bg-amber-100/60 border-y-2 border-slate-900">
                        <td className="border border-slate-900 p-1.5 font-bold font-mono text-[9px] text-center text-amber-900">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td colSpan={6} className="border border-slate-900 p-1.5 text-center font-black uppercase tracking-widest text-[9px] text-amber-900">
                          ★★ RÉCRÉATION & DÉTENTE PÉDAGOGIQUE ★★
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={`slot-${slot.index}`} className="border-b border-slate-800">
                      <td className="border border-slate-900 p-2 text-center font-bold bg-slate-50">
                        <div className="text-[10px] font-black">{slot.label}</div>
                        <div className="text-[9px] font-mono text-slate-600">{slot.startTime} - {slot.endTime}</div>
                      </td>

                      {days.map((day) => {
                        const entry = entries.find(e => 
                          e.day.toLowerCase() === day.toLowerCase() && 
                          (e.periodIndex === slot.index || e.period?.startsWith(slot.label.slice(0, 4)))
                        );

                        return (
                          <td key={day} className="border border-slate-900 p-2 text-center align-middle h-16">
                            {entry ? (
                              <div className="space-y-0.5">
                                <div className="font-black text-slate-950 text-[11px] leading-tight">
                                  {entry.subjectName}
                                </div>
                                <div className="text-[10px] font-semibold text-slate-700">
                                  {printType === "teacher" ? `Classe : ${entry.className}` : `Prof : ${entry.teacherName}`}
                                </div>
                                <div className="text-[9px] font-mono font-bold text-slate-600">
                                  Salle : {entry.room || "101"}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Étude / Libre</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Official DRC Signatures & Stamp Section */}
          <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs">
            <div className="space-y-12">
              <div className="font-bold uppercase text-[10px] text-slate-800">Le Délégué de Classe / Représentant</div>
              <div className="text-[9px] text-slate-400 italic">(Signature)</div>
            </div>

            <div className="space-y-12">
              <div className="font-bold uppercase text-[10px] text-slate-800">Le Directeur des Études / Préfet</div>
              <div className="text-[9px] text-slate-400 italic">(Sceau & Signature)</div>
            </div>

            <div className="space-y-12">
              <div className="font-bold uppercase text-[10px] text-slate-800">Le Chef d'Établissement</div>
              <div className="text-[9px] text-slate-400 italic">(Sceau Officiel de l'École)</div>
            </div>
          </div>

          {/* Security & Verification Footer */}
          <div className="border-t border-slate-300 pt-3 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <div>Généré par SmartSchool RDC • Système National de Gestion Scolaire</div>
            <div>Identifiant Unique du Planning : SEC-TIMETABLE-{Date.now().toString(36).toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
