import React, { useState } from "react";
import { safeLocalStorage } from "../../utils/safeStorage";
import {
  Sparkles,
  Calendar,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Bell,
  Layers,
  Tag
} from "lucide-react";

export interface VersionRelease {
  id: string;
  versionNumber: string;
  releaseDate: string;
  title: string;
  type: "Version Majeure" | "Mise à Jour Mineure" | "Patch Correctif";
  status: "Publiée" | "Planifiée" | "Brouillon";
  changelog: {
    newFeatures: string[];
    improvements: string[];
    bugFixes: string[];
    compatibility: string;
  };
}

interface OwnerUpdatesProps {
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function OwnerUpdatesModule({ userName = "Propriétaire SmartSchool RDC", onAuditLog }: OwnerUpdatesProps) {
  const [releases, setReleases] = useState<VersionRelease[]>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_releases");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "rel-485",
        versionNumber: "v4.8.5",
        releaseDate: "2026-08-10",
        title: "Souveraineté Nationale & Sauvegarde Chiffrée AES-256",
        type: "Version Majeure",
        status: "Publiée",
        changelog: {
          newFeatures: [
            "Module de Sauvegarde et Reprise après Sinistre pour le Propriétaire",
            "Module de Sauvegarde Locale (.smartbak) pour tous les établissements",
            "Portail Unifié du Propriétaire avec Monitoring Télémesure Temps Réel"
          ],
          improvements: [
            "Optimisation des temps de réponse lors du chargement des effectifs",
            "Renforcement des règles de sécurité RBAC pour le rôle Propriétaire"
          ],
          bugFixes: [
            "Correction du problème d'affichage du nom de l'établissement dans les reçus",
            "Ajustement du format des numéros de téléphone +243 RDC"
          ],
          compatibility: "Conforme à la Directive EPST 2026-2027"
        }
      },
      {
        id: "rel-480",
        versionNumber: "v4.8.0",
        releaseDate: "2026-07-20",
        title: "Bulletins Numériques Bilingues & Intégration M-Pesa",
        type: "Mise à Jour Mineure",
        status: "Publiée",
        changelog: {
          newFeatures: [
            "Génération de reçus imprimables avec Code QR de vérification",
            "Support natif du Minerval payé via Mobile Money Airtel & Orange"
          ],
          improvements: [
            "Fluidification de l'interface du Registre SaaS"
          ],
          bugFixes: [
            "Correction du calcul automatique de la moyenne du 1er Trimestre"
          ],
          compatibility: "Programme National Officiel RDC"
        }
      }
    ];
  });

  const [showModal, setShowModal] = useState(false);
  const [newVersion, setNewVersion] = useState("v4.9.0");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<VersionRelease["type"]>("Mise à Jour Mineure");
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [newFeaturesList, setNewFeaturesList] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const saveReleases = (updated: VersionRelease[]) => {
    setReleases(updated);
    safeLocalStorage.setItem("ss_owner_releases", JSON.stringify(updated));
  };

  const handleAddFeature = () => {
    if (newFeatureInput.trim()) {
      setNewFeaturesList([...newFeaturesList, newFeatureInput.trim()]);
      setNewFeatureInput("");
    }
  };

  const handlePublishRelease = () => {
    if (!newTitle.trim()) return;

    const release: VersionRelease = {
      id: `rel-${Date.now()}`,
      versionNumber: newVersion,
      releaseDate: new Date().toISOString().slice(0, 10),
      title: newTitle,
      type: newType,
      status: "Publiée",
      changelog: {
        newFeatures: newFeaturesList.length > 0 ? newFeaturesList : ["Améliorations générales des performances"],
        improvements: ["Optimisation du temps de réponse du serveur central"],
        bugFixes: ["Correction de bugs mineurs de saisie"],
        compatibility: "RDC EPST Souverain 2026"
      }
    };

    const updated = [release, ...releases];
    saveReleases(updated);
    setShowModal(false);
    setNewTitle("");
    setNewFeaturesList([]);

    if (onAuditLog) onAuditLog("Publication Mise à Jour", `Publication de la version ${newVersion} - ${newTitle}`);
    setToast(`La version ${newVersion} a été publiée et notifiée à tous les établissements.`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl border border-blue-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-300 font-black text-[10px] uppercase rounded-full border border-blue-500/30 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>CENTRE DE DIFFUSION DES VERSIONS & CHANGELOG</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Centre des Mises à Jour (Release Notes)</h2>
          <p className="text-xs text-slate-300 mt-1">
            Publiez les nouvelles fonctionnalités, correctifs et notes de version notifiées automatiquement à tous les établissements de la plateforme.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg flex items-center space-x-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Publier une Nouvelle Version</span>
        </button>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl border border-emerald-500 flex items-center space-x-2 text-xs font-bold shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Releases List */}
      <div className="space-y-4">
        {releases.map(r => (
          <div
            key={r.id}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-indigo-600 text-white font-mono font-black text-xs rounded-xl">
                  {r.versionNumber}
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{r.title}</h3>
                  <div className="text-[11px] text-slate-500">{r.type} • Publié le {r.releaseDate}</div>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase rounded-full">
                {r.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-black text-emerald-600 dark:text-emerald-400 text-[11px] uppercase">
                  Nouvelles Fonctionnalités
                </div>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 text-[11px]">
                  {r.changelog.newFeatures.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-black text-blue-600 dark:text-blue-400 text-[11px] uppercase">
                  Améliorations
                </div>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 text-[11px]">
                  {r.changelog.improvements.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-black text-amber-600 dark:text-amber-400 text-[11px] uppercase">
                  Corrections &amp; Compatibilité
                </div>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 text-[11px]">
                  {r.changelog.bugFixes.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  Norme: {r.changelog.compatibility}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal New Release */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Publier une Note de Version</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Numéro de Version</label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={e => setNewVersion(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Titre de la Mise à Jour</label>
                <input
                  type="text"
                  placeholder="Ex: Optimisation des Bulletins & Paiement Mobile Money"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Type de Version</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="Mise à Jour Mineure">Mise à Jour Mineure</option>
                  <option value="Version Majeure">Version Majeure</option>
                  <option value="Patch Correctif">Patch Correctif</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Ajouter une Fonctionnalité</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={e => setNewFeatureInput(e.target.value)}
                    placeholder="Saisir un point clé..."
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                  >
                    Ajouter
                  </button>
                </div>
                {newFeaturesList.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-indigo-600 text-[11px]">
                    {newFeaturesList.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handlePublishRelease}
                className="px-5 py-2 bg-blue-600 text-white font-black text-xs uppercase rounded-xl hover:bg-blue-500 cursor-pointer"
              >
                Publier Immédiatement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
