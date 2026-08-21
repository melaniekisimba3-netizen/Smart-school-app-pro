import { CnrResource, TemplateHistory } from "../types";

// Branches configuration for the 6ème Primaire Bulletin as shown in the EPST image
export interface BulletinBranch {
  name: string;
  maxInterro: number;
  maxExamen: number;
  maxPeriod: number; // usually maxInterro * 2
  maxTrimester: number; // maxPeriod + maxExamen
  maxAnnual: number; // maxTrimester * 3
}

export interface BulletinDomain {
  name: string;
  branches: BulletinBranch[];
}

export const BULLETIN_6EME_DOMAINS: BulletinDomain[] = [
  {
    name: "DOMAINE DES LANGUES",
    branches: [
      { name: "Langues Congolaises (Gram. & Conj.)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Langues Congolaises (Exp. Orale & Vocab.)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Langues Congolaises (Orth. & Rédaction)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Français (Exp. Orale & Vocab.)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Français (Orthographe)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Français (Rédaction)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Français (Gram., Conj., Analyse)", maxInterro: 20, maxExamen: 40, maxPeriod: 40, maxTrimester: 80, maxAnnual: 240 },
      { name: "Lecture - Écriture en Langues Congolaises", maxInterro: 20, maxExamen: 40, maxPeriod: 40, maxTrimester: 80, maxAnnual: 240 },
      { name: "Lecture - Écriture en Langue Française", maxInterro: 20, maxExamen: 40, maxPeriod: 40, maxTrimester: 80, maxAnnual: 240 }
    ]
  },
  {
    name: "DOMAINE DES MATHÉMATIQUES, SCIENCES ET TECHNOLOGIE",
    branches: [
      { name: "Mathématiques (Numération)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Mathématiques (Opérations)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Mathématiques (Mesures des grandeurs)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Mathématiques (Formes géométriques)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Mathématiques (Problèmes)", maxInterro: 20, maxExamen: 40, maxPeriod: 40, maxTrimester: 80, maxAnnual: 240 },
      { name: "Sciences (Physique, Zoologie, Physiologie)", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Sciences (Anatomie, Botanique)", maxInterro: 20, maxExamen: 40, maxPeriod: 40, maxTrimester: 80, maxAnnual: 240 },
      { name: "Technologie", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 }
    ]
  },
  {
    name: "DOMAINE DE L'UNIVERS SOCIAL ET ENVIRONNEMENT",
    branches: [
      { name: "Éducation Civique & Morale", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Éducation Santé & Environnement", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Géographie", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Histoire", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 }
    ]
  },
  {
    name: "DOMAINE DES ARTS",
    branches: [
      { name: "Arts Plastiques", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Arts Dramatiques", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 }
    ]
  },
  {
    name: "DOMAINE DU DÉVELOPPEMENT PERSONNEL",
    branches: [
      { name: "Initiation aux Travaux Productifs", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Éducation Physique & Sportive", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 },
      { name: "Religion / Morale", maxInterro: 10, maxExamen: 20, maxPeriod: 20, maxTrimester: 40, maxAnnual: 120 }
    ]
  }
];

// Rich default templates database representing different official EPST documents
export const initialTemplateModels: CnrResource[] = [
  {
    id: "cnr-1",
    title: "Bulletin National Unifié Primaire (6ème Année)",
    type: "document",
    category: "bulletin",
    version: "v2.1.0",
    status: "approuve",
    publishedAt: "25/05/2026",
    effectiveDate: "01/09/2026",
    author: "Inspecteur Général de l'EPST",
    description: "Modèle de bulletin officiel obligatoire de l'élève au degré terminal (6ème année primaire). Conforme au standard officiel du Secrétariat à l'Éducation Nationale.",
    fileSize: "1.8 Mo",
    contentSummary: "Grille d'évaluation sur 3720 points annuels divisée en 5 domaines de compétences fondamentaux. Intègre l'identification nationale par QR Code d'authenticité.",
    variables: [
      "Nom_Eleve", "PostNom", "Prénom", "Matricule", "Classe", "Année_Scolaire", 
      "École", "Province", "Ville", "Commune", "Sexe", "Lieu_Naissance", "Date_Naissance",
      "Total_Trim1", "Total_Trim2", "Total_Trim3", "Total_General", "Pourcentage", "Rang", "Nbre_Eleves",
      "Application", "Conduite", "Signature_Directeur", "Signature_Préfet", "Cachet", "QRCode"
    ],
    contentRaw: JSON.stringify({
      title: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO - BULLETIN DE L'ÉLÈVE DEGRÉ TERMINAL",
      codeDocument: "IGE/P.S/006",
      layout: "A4_Portrait_DoubleBorder",
      domains: BULLETIN_6EME_DOMAINS,
      totalMaxAnnual: 3720,
      totalMaxTrimester: 1240,
      instructions: "Interdiction formelle de reproduire ce bulletin sous peine des sanctions prévues par la loi."
    }, null, 2),
    history: [
      {
        id: "hist-1-1",
        version: "v2.1.0",
        updatedAt: "25/05/2026",
        author: "Prof. Mbata Kabongo (Ministère)",
        changeSummary: "Mise à jour du barème d'anglais et ajout du filigrane de souveraineté nationale de la RDC.",
        status: "approuve",
        contentRaw: "{}"
      },
      {
        id: "hist-1-2",
        version: "v2.0.0",
        updatedAt: "12/01/2026",
        author: "Jean-Félix Mwaba (CNR-EPST)",
        changeSummary: "Version de transition intégrant la nouvelle numérotation des ID cryptographiques de sécurité.",
        status: "archive",
        contentRaw: "{}"
      }
    ]
  },
  {
    id: "cnr-2",
    title: "Calendrier Académique National Officiel 2025-2026",
    type: "document",
    category: "calendrier",
    version: "v1.0.3",
    status: "approuve",
    publishedAt: "10/08/2025",
    effectiveDate: "01/09/2025",
    author: "Secrétariat Général de l'EPST",
    description: "Calendrier de régulation nationale fixant les dates clés de la rentrée scolaire, des congés, et des examens nationaux (TENASOSP, ENAFEP et Examen d'État).",
    fileSize: "850 Ko",
    contentSummary: "Débute le 08 Septembre 2025 et se clôture le 02 Juillet 2026. Comprend 222 jours d'enseignement obligatoire pour tous les réseaux publics et privés.",
    variables: ["École", "Année_Scolaire", "Province", "Ville", "Date_Rentrée", "Examens_Sem1", "Examens_Sem2", "Date_Clôture"],
    contentRaw: JSON.stringify({
      events: [
        { date: "08/09/2025", title: "Rentrée Scolaire Nationale" },
        { date: "15/12/2025", title: "Début Examens Premier Semestre" },
        { date: "24/12/2025", title: "Vacances de Noël et de Nouvel An" },
        { date: "07/01/2026", title: "Reprise des Cours" },
        { date: "23/02/2026", title: "Semaine de la Citoyenneté et de la Culture" },
        { date: "15/05/2026", title: "Début Examens Second Semestre" },
        { date: "01/06/2026", title: "Épreuves de l'ENAFEP & TENASOSP" },
        { date: "22/06/2026", title: "Début de la Session Ordinaire de l'Examen d'État" },
        { date: "02/07/2026", title: "Clôture de l'Année Scolaire & Remise des Bulletins" }
      ],
      legalNotice: "Toute dérogation au calendrier officiel doit être validée par le Gouverneur de Province après avis de l'IPSP."
    }, null, 2),
    history: [
      {
        id: "hist-2-1",
        version: "v1.0.3",
        updatedAt: "10/08/2025",
        author: "Secrétaire Général",
        changeSummary: "Ajustement des dates de l'Examen d'État pour éviter les chevauchements avec les fêtes nationales.",
        status: "approuve",
        contentRaw: "{}"
      }
    ]
  },
  {
    id: "cnr-3",
    title: "Attestation de Fréquentation Scolaire Standardisée",
    type: "document",
    category: "attestation",
    version: "v1.1.0",
    status: "approuve",
    publishedAt: "18/03/2026",
    effectiveDate: "01/04/2026",
    author: "Direction de la Scolarité",
    description: "Modèle unique d'attestation établissant la scolarisation d'un élève dans un établissement agréé, requise pour les allocations familiales.",
    fileSize: "420 Ko",
    contentSummary: "Génération automatique avec variables d'identification d'élève, année d'études et visa de l'Inspecteur Provincial de secteur.",
    variables: [
      "Nom_Eleve", "PostNom", "Prénom", "Matricule", "Classe", "Option", 
      "Année_Scolaire", "École", "Province", "Ville", "Date_Emission", "Signature_Directeur", "QRCode"
    ],
    contentRaw: `RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
MINISTÈRE DE L'ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETE

ATTESTATION DE FRÉQUENTATION SCOLAIRE
N° Réf : EPST/{{Province}}/{{École}}/{{Matricule}}-2026

Le Directeur soussigné du Complexe Scolaire {{École}}, situé dans la Province Éducationnelle de {{Province}}, certifie par la présente que l'élève :

Nom : {{Nom_Eleve}}
Postnom & Prénom : {{PostNom}} {{Prénom}}
Numéro Matricule : {{Matricule}}

est régulièrement inscrit(e) dans notre établissement pour l'Année Scolaire {{Année_Scolaire}}, en classe de {{Classe}} (Option : {{Option}}).

En foi de quoi, la présente attestation lui est délivrée pour faire valoir ce que de droit.

Fait à {{Ville}}, le {{Date_Emission}}

Le Chef d'Établissement,
{{Signature_Directeur}}

Authentification Securisée : {{QRCode}}`,
    history: [
      {
        id: "hist-3-1",
        version: "v1.1.0",
        updatedAt: "18/03/2026",
        author: "Ir. Gabriel Tshimanga",
        changeSummary: "Intégration du format d'en-tête ministériel révisé pour 2026.",
        status: "approuve",
        contentRaw: ""
      }
    ]
  },
  {
    id: "cnr-4",
    title: "Certificat d'Aptitude Professionnelle (Arts & Métiers)",
    type: "document",
    category: "certificat",
    version: "v1.0.1",
    status: "en_validation",
    publishedAt: "22/06/2026",
    effectiveDate: "15/07/2026",
    author: "Direction de la Formation Professionnelle",
    description: "Modèle officiel de certificat sanctionnant les études de cycle court professionnel pour les options techniques.",
    fileSize: "920 Ko",
    contentSummary: "Certificat de fin d'études secondaires techniques, avec cachet ministériel et grille d'évaluation des compétences pratiques.",
    variables: [
      "Nom_Eleve", "PostNom", "Prénom", "Matricule", "Option", "Année_Scolaire", 
      "École", "Province", "Mention", "Décision", "Signature_Préfet", "Signature_Directeur", "QRCode"
    ],
    contentRaw: JSON.stringify({
      header: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO - CERTIFICAT D'APTITUDE PROFESSIONNELLE",
      layout: "A4_Landscape_Ornamental",
      textTemplate: "Le Ministère de l'Éducation Nationale décerne ce présent Certificat à {{Prénom}} {{Nom_Eleve}} {{PostNom}}, né(e) à {{Lieu_Naissance}} le {{Date_Naissance}}, pour avoir achevé avec succès le cycle de formation professionnelle de {{Option}} au Complexe Scolaire {{École}} avec la mention {{Mention}}.",
      securityCode: "CAP-RDC-{{Matricule}}"
    }, null, 2),
    history: [
      {
        id: "hist-4-1",
        version: "v1.0.1",
        updatedAt: "22/06/2026",
        author: "Madame Mireille Masangu",
        changeSummary: "Soumission pour validation finale auprès de l'Inspection Nationale.",
        status: "en_validation",
        contentRaw: "{}"
      }
    ]
  },
  {
    id: "cnr-5",
    title: "Bulletin National Maternelle Unifié",
    type: "document",
    category: "bulletin",
    version: "v1.0.0",
    status: "approuve",
    publishedAt: "15/06/2026",
    effectiveDate: "01/09/2026",
    author: "Inspectrice Provinciale de la Maternelle",
    description: "Modèle national officiel d'évaluation par compétences pour l'enseignement maternel (Petite, Moyenne, Grande section). Utilise les indicateurs qualitatifs de développement.",
    fileSize: "1.1 Mo",
    contentSummary: "Grille d'évaluation des compétences psychomotrices, cognitives et psychosociales de la petite enfance.",
    variables: [
      "Nom_Eleve", "PostNom", "Prénom", "Matricule", "Classe", "Année_Scolaire", 
      "École", "Province", "Signature_Directeur", "Cachet", "QRCode"
    ],
    contentRaw: JSON.stringify({
      title: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO - ENSEIGNEMENT MATERNEL",
      codeDocument: "IGE/M.S/001",
      layout: "A4_Portrait_Warm",
      competencies: [
        { category: "Activités de Langage", items: ["Expression orale", "Vocabulaire", "Compréhension", "Pré-lecture"] },
        { category: "Activités Graphiques", items: ["Tenue du crayon", "Tracé de lignes", "Coloriage", "Précision du geste"] },
        { category: "Logico-Mathématiques", items: ["Dénombrement", "Classification", "Repérage spatial", "Formes & couleurs"] },
        { category: "Éveil & Social", items: ["Observation", "Hygiène & Santé", "Règles de vie", "Respect d'autrui"] },
        { category: "Physiques & Arts", items: ["Motricité", "Chant & Rythme", "Découpage/Collage", "Expression corporelle"] }
      ]
    }, null, 2),
    history: []
  },
  {
    id: "cnr-6",
    title: "Bulletin National Secondaire & Humanités",
    type: "document",
    category: "bulletin",
    version: "v3.0.1",
    status: "approuve",
    publishedAt: "28/05/2026",
    effectiveDate: "01/09/2026",
    author: "Inspecteur Général de l'EPST",
    description: "Modèle national unifié de bulletins pour le Tronc Commun (7e et 8e) et le cycle des Humanités RDC (Scientifique, Littéraire, Commerciale, Technique).",
    fileSize: "2.4 Mo",
    contentSummary: "Grille d'évaluation semestrielle et périodique avec colonnes d'examen, de pondération et de cumul annuel.",
    variables: [
      "Nom_Eleve", "PostNom", "Prénom", "Matricule", "Classe", "Option", "Année_Scolaire", 
      "École", "Province", "Pourcentage", "Rang", "Nbre_Eleves", "Conduite", "Application", "Signature_Préfet", "Cachet", "QRCode"
    ],
    contentRaw: JSON.stringify({
      title: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO - ENSEIGNEMENT SECONDAIRE ET HUMANITÉS",
      codeDocument: "IGE/S.H/002",
      layout: "A4_Portrait_Classic",
      subjects: [
        "Français", "Anglais", "Histoire", "Géographie", "Mathématiques", "Physique", "Chimie", "Biologie", "Philosophie", "Éducation Citoyenne"
      ]
    }, null, 2),
    history: []
  }
];

export const ALL_VARIABLES_HELP = [
  { key: "{{Nom_Eleve}}", desc: "Nom de famille de l'élève" },
  { key: "{{PostNom}}", desc: "Postnom de l'élève (nom d'alliance)" },
  { key: "{{Prénom}}", desc: "Prénom de l'élève" },
  { key: "{{Matricule}}", desc: "Numéro de matricule national unique de l'élève" },
  { key: "{{Sexe}}", desc: "Sexe de l'élève (M ou F)" },
  { key: "{{Lieu_Naissance}}", desc: "Lieu de naissance de l'élève" },
  { key: "{{Date_Naissance}}", desc: "Date de naissance de l'élève" },
  { key: "{{Classe}}", desc: "Classe actuelle de l'élève (ex: 6ème Année)" },
  { key: "{{Option}}", desc: "Filière / Option d'études (ex: Sciences, Pédagogie)" },
  { key: "{{Section}}", desc: "Section scolaire (ex: Primaire, Humanités)" },
  { key: "{{Année_Scolaire}}", desc: "Année académique active (ex: 2025-2026)" },
  { key: "{{École}}", desc: "Nom officiel homologué de l'école" },
  { key: "{{Province}}", desc: "Province éducationnelle de l'école (ex: Kinshasa-Funa)" },
  { key: "{{Ville}}", desc: "Ville de localisation de l'école" },
  { key: "{{Commune}}", desc: "Commune d'implantation de l'école" },
  { key: "{{Total_General}}", desc: "Cumul général des points obtenus par l'élève" },
  { key: "{{Pourcentage}}", desc: "Pourcentage annuel d'excellence de l'élève" },
  { key: "{{Rang}}", desc: "Rang / Place de l'élève dans sa classe" },
  { key: "{{Nbre_Eleves}}", desc: "Nombre total d'élèves inscrits dans la classe" },
  { key: "{{Mention}}", desc: "Mention de mérite académique (Distinction, Satisfaction, etc.)" },
  { key: "{{Décision}}", desc: "Décision d'avancement (Admis, Refusé, Redouble)" },
  { key: "{{Conduite}}", desc: "Appréciation de conduite disciplinaire" },
  { key: "{{Application}}", desc: "Appréciation d'application de l'élève" },
  { key: "{{Signature_Directeur}}", desc: "Griffe numérique du Chef d'Établissement" },
  { key: "{{Signature_Préfet}}", desc: "Griffe numérique du Préfet des études" },
  { key: "{{QRCode}}", desc: "QR Code d'authenticité de sécurité nationale" }
];
