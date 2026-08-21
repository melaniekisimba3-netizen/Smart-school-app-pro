import React, { useState } from "react";
import { 
  History, RotateCcw, ArrowRight, ShieldCheck, Search, Filter, 
  Calendar, FileText, UserCheck, Eye, Download, Printer 
} from "lucide-react";
import { ResponsibilityTransferRecord } from "../../types";

interface StaffTransferHistoryTableProps {
  records: ResponsibilityTransferRecord[];
  onPrintRecord?: (record: ResponsibilityTransferRecord) => void;
}

export function StaffTransferHistoryTable({
  records,
  onPrintRecord
}: StaffTransferHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ResponsibilityTransferRecord | null>(null);

  const filteredRecords = records.filter(r => 
    r.sourceStaffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.targetStaffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.transferredPortalName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Registre Inaltérable des Passations ({records.length})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historique de toutes les délégations et transferts de responsabilités
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, motif, portail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table Container */}
      {filteredRecords.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
          <RotateCcw className="h-8 w-8 mx-auto mb-2 text-slate-400 opacity-50" />
          <p className="text-sm font-bold">Aucun acte de passation enregistré pour l'instant.</p>
          <p className="text-xs text-slate-400 mt-1">
            Les transferts de responsabilités effectués depuis la liste du personnel apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Date & Réf</th>
                  <th className="py-3 px-4">Collaborateur Cédant</th>
                  <th className="py-3 px-4">Collaborateur Successeur</th>
                  <th className="py-3 px-4">Responsabilités & Portail</th>
                  <th className="py-3 px-4">Motif</th>
                  <th className="py-3 px-4">Autorisé Par</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-black text-slate-900 dark:text-white">
                        {rec.transferredAt}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rec.id}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rec.sourceStaffName}
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400">
                        {rec.sourceStaffFonction}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400">
                        {rec.targetStaffName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {rec.targetStaffFonction}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-indigo-700 dark:text-indigo-300 truncate">
                        🌐 {rec.transferredPortalName || "Portail assigné"}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {rec.transferredResponsibilities.length} responsabilité(s) : {rec.transferredResponsibilities.slice(0, 2).join(", ")}
                        {rec.transferredResponsibilities.length > 2 ? "..." : ""}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-bold">
                        {rec.reason}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-bold">
                      {rec.transferredBy}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Détails</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
                  Acte Officiel de Passation de Responsabilités
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Réf: {selectedRecord.id} • Date: {selectedRecord.transferredAt}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Collaborateur Cédant</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{selectedRecord.sourceStaffName}</span>
                <span className="block text-slate-500">{selectedRecord.sourceStaffFonction} ({selectedRecord.sourceStaffEmail})</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Collaborateur Successeur</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">{selectedRecord.targetStaffName}</span>
                <span className="block text-slate-500">{selectedRecord.targetStaffFonction} ({selectedRecord.targetStaffEmail})</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[11px]">
                📌 Responsabilités Transférées :
              </span>
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-1">
                {selectedRecord.transferredResponsibilities.map((resp, i) => (
                  <div key={i} className="font-bold text-emerald-900 dark:text-emerald-200">
                    • {resp}
                  </div>
                ))}
              </div>
            </div>

            {selectedRecord.notes && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[11px]">
                  Consignes & Notes de Passation :
                </span>
                <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 whitespace-pre-line">
                  {selectedRecord.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Autorisé par : <strong className="text-slate-900 dark:text-white">{selectedRecord.transferredBy}</strong>
              </span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
