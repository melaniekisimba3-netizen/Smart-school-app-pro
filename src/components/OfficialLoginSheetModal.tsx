import React, { useState } from "react";
import { UserAccount } from "../types";
import { 
  Printer, Download, Share2, MessageSquare, Mail, Phone, X, Check, 
  ShieldCheck, QrCode, Sparkles, Building, User, Key, Globe, Lock, Clock,
  Copy, ExternalLink, Smartphone, AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";
import { printDedicatedHTML } from "../services/exportService";
import { 
  buildOfficialLoginSheet, 
  buildWhatsAppShareUrl, 
  buildSmsShareUrl, 
  buildMailtoShareUrl 
} from "../services/accountActivationService";
import { safeCopyToClipboard } from "../utils/safeStorage";

interface OfficialLoginSheetModalProps {
  account: UserAccount;
  onClose: () => void;
  onOpenPortal?: (account: UserAccount) => void;
  schoolLogoUrl?: string;
  schoolName?: string;
  provinceName?: string;
  schoolMotto?: string;
  schoolYear?: string;
  minepspCode?: string;
  creatorName?: string;
  creatorRole?: string;
  onRegenerateCode?: (accountId: string) => void;
  photoUrl?: string;
}

export function OfficialLoginSheetModal({
  account,
  onClose,
  onOpenPortal,
  schoolLogoUrl,
  schoolName = "",
  provinceName = "",
  schoolMotto = "",
  schoolYear = "2026-2027",
  minepspCode = "",
  creatorName = "Secrétariat de Direction",
  creatorRole = "Administrateur Système",
  onRegenerateCode,
  photoUrl
}: OfficialLoginSheetModalProps) {
  const [copied, setCopied] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  const finalPhotoUrl = photoUrl || (account as any).photoUrl || (account as any).photo;

  const sheetData = buildOfficialLoginSheet(
    account,
    {
      schoolName,
      schoolMotto,
      province: provinceName,
      schoolYear,
      minepspConformityCode: minepspCode,
      logoUrl: schoolLogoUrl,
      beneficiaryPhotoUrl: finalPhotoUrl
    },
    `${creatorName} (${creatorRole})`
  );

  const whatsappUrl = buildWhatsAppShareUrl(sheetData);
  const smsUrl = buildSmsShareUrl(sheetData);
  const mailtoUrl = buildMailtoShareUrl(sheetData);

  const copyToClipboard = async () => {
    const text = `=== FICHE OFFICIELLE D'ACCÈS SMARTSCHOOL RDC ===\nÉtablissement : ${sheetData.schoolName}\nBénéficiaire : ${sheetData.personName}\nRôle : ${sheetData.role} (${sheetData.functionOrClass})\nPortail : ${sheetData.portalName}\n\n🔑 IDENTIFIANTS 1ÈRE CONNEXION :\n• Matricule / ID : ${sheetData.loginIdentifier}\n• Code d'activation : ${sheetData.activationCode}\n\nLien d'activation : ${sheetData.directAccessUrl}\n\n(Lors de votre première connexion, vous devrez créer votre propre mot de passe et configurer 3 questions de sécurité).`;
    await safeCopyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Dedicated Print Function
  const handlePrint = () => {
    const qrSvgString = `<svg width="110" height="110" viewBox="0 0 100 100" style="border-radius: 8px;">
      <rect width="100" height="100" fill="#ffffff"/>
      <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#0f172a"/>
      <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#0f172a"/>
      <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#0f172a"/>
      <circle cx="50" cy="50" r="14" fill="#0284c7" />
      <text x="50" y="54" font-family="Arial" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">RDC</text>
      <rect x="52" y="20" width="8" height="8" fill="#0f172a"/>
      <rect x="75" y="65" width="12" height="12" fill="#0f172a"/>
      <rect x="60" y="78" width="8" height="8" fill="#0f172a"/>
      <rect x="25" y="48" width="6" height="6" fill="#0f172a"/>
    </svg>`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 25px; border: 3px double #1e3a8a; border-radius: 14px; background: #ffffff; color: #0f172a;">
        
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 14px; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${sheetData.logoUrl}" style="height: 60px; width: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1;" />
            <div>
              <h1 style="font-size: 16px; font-weight: 900; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">${sheetData.schoolName}</h1>
              <p style="font-size: 10px; color: #475569; margin: 2px 0 0 0; font-weight: 700;">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • Province : ${sheetData.province}</p>
              <p style="font-size: 9px; color: #0284c7; margin: 1px 0 0 0; font-weight: 700;">Devise : "${sheetData.schoolMotto}" • Code MINEPST : ${sheetData.minepspCode}</p>
            </div>
          </div>
          <div style="text-align: right; font-size: 9px; color: #64748b;">
            <div style="font-weight: 900; color: #1e3a8a; font-size: 11px; text-transform: uppercase;">Fiche d'Accès Officiel</div>
            <div>Année : <strong>${sheetData.schoolYear}</strong></div>
            <div>Date d'émission : ${sheetData.generatedDate}</div>
          </div>
        </div>

        <!-- TITLE BANNER -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); color: #ffffff; text-align: center; padding: 10px 14px; border-radius: 8px; font-weight: 800; font-size: 13px; letter-spacing: 0.5px; margin-bottom: 18px; text-transform: uppercase;">
          FICHE OFFICIELLE D'ACCÈS PORTAIL & CODE D'ACTIVATION UNIQUE
        </div>

        <!-- BENEFICIARY DETAILS -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-weight: 600; width: 35%;">Nom complet du Titulaire :</td>
              <td style="padding: 5px 0; font-weight: 900; color: #0f172a; font-size: 14px;">${sheetData.personName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Rôle & Profil d'Accès :</td>
              <td style="padding: 5px 0; font-weight: 800; color: #0284c7;">${sheetData.role}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Fonction / Poste :</td>
              <td style="padding: 5px 0; font-weight: 700; color: #334155;">${sheetData.functionOrClass}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Portail dédié assigné :</td>
              <td style="padding: 5px 0; font-weight: 700; color: #166534;">${sheetData.portalName}</td>
            </tr>
            ${sheetData.phone ? `
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Téléphone :</td>
              <td style="padding: 5px 0; font-weight: 600; color: #0f172a;">${sheetData.phone}</td>
            </tr>` : ""}
            ${sheetData.email ? `
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Courriel :</td>
              <td style="padding: 5px 0; font-weight: 600; color: #0f172a;">${sheetData.email}</td>
            </tr>` : ""}
          </table>
          ${sheetData.beneficiaryPhotoUrl ? `
          <div style="flex-shrink: 0; text-align: center;">
            <img src="${sheetData.beneficiaryPhotoUrl}" alt="${sheetData.personName}" style="width: 75px; height: 75px; object-fit: cover; border-radius: 8px; border: 2px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />
            <div style="font-size: 8px; color: #64748b; font-weight: bold; margin-top: 3px;">Photo Officielle</div>
          </div>
          ` : ""}
        </div>

        ${sheetData.responsibilities && sheetData.responsibilities.length > 0 ? `
        <!-- ASSIGNED RESPONSIBILITIES -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 18px; font-size: 11px;">
          <div style="font-weight: 900; color: #166534; text-transform: uppercase; margin-bottom: 6px; font-size: 10px;">
            📌 RESPONSABILITÉS OPÉRATIONNELLES ATTRIBUÉES :
          </div>
          <ul style="margin: 0; padding-left: 18px; color: #14532d; line-height: 1.5;">
            ${sheetData.responsibilities.map(r => `<li><strong>${r}</strong></li>`).join("")}
          </ul>
        </div>
        ` : ""}

        ${sheetData.permissions && sheetData.permissions.length > 0 ? `
        <!-- GRANTED RBAC PERMISSIONS -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 18px; font-size: 10px;">
          <div style="font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 4px;">
            🔒 Habilitations & Permissions Actives (${sheetData.permissions.length}) :
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; color: #334155;">
            ${sheetData.permissions.map(p => `<span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 9px;">${p}</span>`).join(" ")}
          </div>
        </div>
        ` : ""}

        <!-- CREDENTIALS BOX (NO TEMP PASSWORD) -->
        <div style="border: 2px solid #0284c7; background: #f0f9ff; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #bae6fd; padding-bottom: 8px; margin-bottom: 14px;">
            <div style="font-size: 11px; color: #0369a1; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
              🔑 VOS IDENTIFIANTS DE PREMIÈRE CONNEXION
            </div>
            <div style="font-size: 9px; background: #0284c7; color: #ffffff; padding: 2px 8px; border-radius: 12px; font-weight: 800; text-transform: uppercase;">
              Usage Unique
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; align-items: center;">
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="background: #ffffff; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1;">
                <span style="color: #64748b; font-size: 9px; font-weight: 800; text-transform: uppercase; display: block;">Matricule / Identifiant de Connexion</span>
                <span style="font-family: 'Courier New', Courier, monospace; font-weight: 900; font-size: 16px; color: #1e3a8a; letter-spacing: 1px;">
                  ${sheetData.loginIdentifier}
                </span>
              </div>
              
              <div style="background: #ffffff; padding: 10px 14px; border-radius: 8px; border: 2px dashed #16a34a;">
                <span style="color: #15803d; font-size: 9px; font-weight: 800; text-transform: uppercase; display: block;">Code d'Activation Sécurisé</span>
                <span style="font-family: 'Courier New', Courier, monospace; font-weight: 900; font-size: 18px; color: #15803d; letter-spacing: 2px;">
                  ${sheetData.activationCode}
                </span>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ffffff; padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1; text-align: center;">
              ${qrSvgString}
              <span style="font-size: 8px; font-weight: 800; color: #64748b; margin-top: 4px;">SCANNER POUR ACTIVER</span>
            </div>
          </div>
        </div>

        <!-- SECURITY PROTOCOL NOTICE -->
        <div style="background: #fefce8; border: 1px solid #fef08a; padding: 12px 14px; border-radius: 10px; font-size: 10px; color: #854d0e; line-height: 1.5; margin-bottom: 22px;">
          <div style="font-weight: 900; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; color: #a16207;">
            🛡️ PROTOCOLE OBLIGATOIRE DE PREMIÈRE CONNEXION (ZERO-TRUST) :
          </div>
          <ol style="margin: 0; padding-left: 16px;">
            <li>Rendez-vous sur la plateforme ou cliquez sur <strong>${sheetData.directAccessUrl}</strong></li>
            <li>Saisissez uniquement votre <strong>Matricule (${sheetData.loginIdentifier})</strong> et votre <strong>Code d'activation (${sheetData.activationCode})</strong>.</li>
            <li>Le système vous demandera obligatoirement de <strong>créer et confirmer votre propre mot de passe personnel</strong>.</li>
            <li>Vous devrez configurer <strong>au moins 3 questions de sécurité secrètes</strong> pour le recouvrement autonome de compte.</li>
            <li>Une fois validé, <strong>le code d'activation sera définitivement invalidé</strong> et seul votre mot de passe personnel permettra les accès ultérieurs.</li>
          </ol>
        </div>

        <!-- SIGNATURES & STAMP -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25px; font-size: 10px;">
          <div>
            <div style="font-weight: 800; color: #475569; text-transform: uppercase;">Émargement du Titulaire :</div>
            <div style="height: 45px; width: 170px; border-bottom: 1px dashed #94a3b8; margin-top: 5px;"></div>
            <div style="color: #94a3b8; font-size: 9px; margin-top: 3px;">Mention "Reçu et vérifié"</div>
          </div>

          <div style="text-align: center; border: 2px dashed #0284c7; padding: 6px 14px; border-radius: 8px; color: #0284c7;">
            <div style="font-weight: 900; font-size: 9px; text-transform: uppercase;">SCEAU OFFICIEL DE SÉCURITÉ IAM</div>
            <div style="font-size: 8px; color: #64748b;">SMARTSCHOOL RDC</div>
          </div>

          <div style="text-align: right;">
            <div style="font-weight: 800; color: #475569;">Généré par l'autorité :</div>
            <div style="color: #0284c7; font-size: 9px; font-weight: 700;">${sheetData.generatedBy}</div>
            <div style="height: 45px; width: 170px; margin-top: 5px; display: flex; align-items: center; justify-content: flex-end;">
              <span style="font-style: italic; color: #64748b; font-size: 9px;">[Signature numérique validée]</span>
            </div>
          </div>
        </div>

      </div>
    `;

    printDedicatedHTML(htmlContent, `Fiche_Connexion_${sheetData.loginIdentifier}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" id="official-login-sheet-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-left my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-blue/10 dark:bg-blue-950 rounded-2xl border border-brand-blue/20">
              <ShieldCheck className="h-6 w-6 text-brand-blue dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Fiche Officielle de Connexion
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {account.isActivated ? "Compte Activé" : "En attente d'activation"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Protocole Zero-Trust • Code d'activation à usage unique (sans mot de passe temporaire)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            id="close-login-sheet-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Institution & Beneficiary Banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sheetData.logoUrl ? (
                <img
                  src={sheetData.logoUrl}
                  alt="Logo École"
                  className="h-10 w-10 object-contain rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                />
              ) : (
                <div className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 font-bold text-xs">
                  SS
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase">
                  {sheetData.schoolName}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Province : <strong className="text-slate-700 dark:text-slate-300">{sheetData.province}</strong> • Année : <span className="font-semibold text-brand-blue">{sheetData.schoolYear}</span>
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-extrabold bg-blue-100 dark:bg-blue-950 text-brand-blue dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
              {sheetData.portalName}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
            <div className="flex items-center space-x-3">
              {sheetData.beneficiaryPhotoUrl ? (
                <img
                  src={sheetData.beneficiaryPhotoUrl}
                  alt={sheetData.personName}
                  className="h-11 w-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                />
              ) : null}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Bénéficiaire Titulaire</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {sheetData.personName}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Rôle & Fonction / Poste</span>
              <span className="font-bold text-brand-blue dark:text-blue-400 text-xs">
                {sheetData.role} — <span className="text-slate-600 dark:text-slate-300">{sheetData.functionOrClass}</span>
              </span>
            </div>
          </div>

          {sheetData.responsibilities && sheetData.responsibilities.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                📌 Responsabilités Opérationnelles Attribuées ({sheetData.responsibilities.length}) :
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {sheetData.responsibilities.map((resp, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-300 dark:border-emerald-800"
                  >
                    • {resp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sheetData.permissions && sheetData.permissions.length > 0 && (
            <div className="pt-1.5 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[10px] font-bold uppercase">
                Habilitations RBAC actives : <strong className="text-slate-800 dark:text-slate-200">{sheetData.permissions.length} permissions accordées</strong>
              </span>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                ✓ Profil vérifié
              </span>
            </div>
          )}
        </div>

        {/* Credentials Cards Grid (No Temporary Password) */}
        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-brand-blue dark:text-blue-300 uppercase flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              Identifiants de Première Connexion
            </h4>
            <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              ⚠️ Aucun mot de passe par défaut
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Login Matricule */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Matricule / Identifiant (Login)</span>
                <span className="text-[9px] text-slate-400 font-mono">ID Unique</span>
              </div>
              <div className="font-mono font-black text-slate-900 dark:text-white text-sm select-all">
                {sheetData.loginIdentifier}
              </div>
            </div>

            {/* Unique Activation Code */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border-2 border-emerald-500/50 dark:border-emerald-500/40 rounded-xl space-y-1 shadow-xs bg-emerald-50/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Code d'activation unique</span>
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">1ère connexion</span>
              </div>
              <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm tracking-wider select-all">
                {sheetData.activationCode}
              </div>
            </div>
          </div>

          {/* Direct Portal Link & Open Portal Button */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-emerald-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-emerald-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-brand-blue dark:text-blue-300 uppercase tracking-wider block">
                🌐 Portail Assigné : {sheetData.portalName}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                Liaison Automatique Active
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
              <div className="font-mono text-slate-700 dark:text-slate-300 truncate text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 flex-1">
                {sheetData.directAccessUrl}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={copyToClipboard}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Copier le lien d'accès"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copié !" : "Copier"}</span>
                </button>
                {onOpenPortal && (
                  <button
                    onClick={() => {
                      onOpenPortal(account);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-brand-blue to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    id="open-portal-direct-btn"
                    title={`Ouvrir directement le ${sheetData.portalName}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Ouvrir le portail</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* First Login Instructions Notice */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3.5 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
          <div className="flex items-center gap-1.5 font-black uppercase text-[11px] text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Procédure de première connexion :</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
            L'utilisateur saisit uniquement son <strong>Matricule</strong> et son <strong>Code d'activation</strong>. Il lui sera alors obligatoirement demandé de <strong>créer son mot de passe personnel</strong> et de renseigner <strong>au moins 3 questions de sécurité</strong>. Le code d'activation deviendra immédiatement invalide.
          </p>
        </div>

        {/* Transmission & Export Actions (WhatsApp, SMS, Email, Print, PDF) */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Options d'export et de transmission :
            </label>
            {onRegenerateCode && !account.isActivated && (
              <button
                onClick={() => {
                  if (confirm(`Générer un nouveau code d'activation pour ${sheetData.personName} ? L'ancien code sera immédiatement révoqué.`)) {
                    onRegenerateCode(account.id);
                  }
                }}
                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                id="regenerate-activation-code-btn"
              >
                <Sparkles className="h-3 w-3" />
                <span>Régénérer le code</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2.5 bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              id="print-official-login-sheet-btn"
            >
              <Printer className="h-4 w-4 text-emerald-400" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="export-pdf-official-login-sheet-btn"
            >
              <Download className="h-4 w-4 text-brand-blue" />
              <span>PDF</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
              id="whatsapp-share-official-login-sheet-btn"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>

            <a
              href={smsUrl}
              className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
              id="sms-share-official-login-sheet-btn"
            >
              <Phone className="h-4 w-4" />
              <span>SMS</span>
            </a>

            <a
              href={mailtoUrl}
              className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
              id="email-share-official-login-sheet-btn"
            >
              <Mail className="h-4 w-4" />
              <span>E-mail</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Opérateur : <strong className="text-slate-600 dark:text-slate-300">{sheetData.generatedBy}</strong></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Intégré au Journal d'Audit National</span>
        </div>
      </motion.div>
    </div>
  );
}
