import { PedagogicalCurriculumModel, SchoolRoom } from "../types";

/**
 * MODÈLES PÉDAGOGIQUES OFFICIELS DE LA RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
 * Ministère de l'Éducation Nationale et Nouvelle Citoyenneté (MINEPST / CNR)
 * Conformes aux programmes nationaux par cycle, niveau et option d'études.
 */

export const DEFAULT_SCHOOL_ROOMS: SchoolRoom[] = [
  { id: "room-101", name: "Salle 101", code: "S101", capacity: 45, type: "Classe ordinaire" },
  { id: "room-102", name: "Salle 102", code: "S102", capacity: 45, type: "Classe ordinaire" },
  { id: "room-103", name: "Salle 103", code: "S103", capacity: 40, type: "Classe ordinaire" },
  { id: "room-104", name: "Salle 104", code: "S104", capacity: 40, type: "Classe ordinaire" },
  { id: "room-201", name: "Salle 201 (Secondaire)", code: "S201", capacity: 35, type: "Classe ordinaire" },
  { id: "room-202", name: "Salle 202 (Secondaire)", code: "S202", capacity: 35, type: "Classe ordinaire" },
  { id: "room-lab-info", name: "Laboratoire Informatique", code: "LAB-INFO", capacity: 30, type: "Informatique" },
  { id: "room-lab-sciences", name: "Laboratoire de Sciences & Chimie", code: "LAB-SC", capacity: 32, type: "Laboratoire" },
  { id: "room-atelier", name: "Atelier Pratique & Technique", code: "ATL", capacity: 25, type: "Atelier" },
  { id: "room-amphi", name: "Amphithéâtre Polyvalent", code: "AMPHI", capacity: 150, type: "Amphithéâtre" },
  { id: "room-sport", name: "Terrain de Sport & Gymnastique", code: "SPORT", capacity: 100, type: "Terrain de sport" }
];

export const NATIONAL_CURRICULUM_MODELS: PedagogicalCurriculumModel[] = [
  // 1. CYCLE MATERNELLE
  {
    id: "curriculum-maternelle-standard",
    name: "Modèle National RDC - Cycle Maternelle (Petite / Moyenne / Grande Section)",
    cycle: "Maternelle",
    level: "Section Maternelle",
    optionName: "Tronc Commun Maternelle",
    description: "Programme officiel de développement préscolaire, sensoriel et linguistique en RDC.",
    subjects: [
      { name: "Langage & Communication Orale", category: "Culture Générale", hoursPerWeek: 5, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "MAT-LANG" },
      { name: "Éveil Scientifique & Sensoriel", category: "Scientifique", hoursPerWeek: 4, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "MAT-EVEIL" },
      { name: "Graphisme & Pré-écriture", category: "Culture Générale", hoursPerWeek: 4, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "MAT-GRAPH" },
      { name: "Pré-Mathématiques & Logique", category: "Scientifique", hoursPerWeek: 3, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "MAT-MATH" },
      { name: "Motricité & Éducation Physique", category: "Professionnelle", hoursPerWeek: 4, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "MAT-MOTR" },
      { name: "Éveil Musical, Chant & Arts Plastiques", category: "Professionnelle", hoursPerWeek: 3, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "MAT-ARTS" },
      { name: "Vivre Ensemble & Éducation Morale", category: "Culture Générale", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "MAT-VIVR" }
    ]
  },

  // 2. CYCLE PRIMAIRE (1ère à 6ème Primaire)
  {
    id: "curriculum-primaire-degre-terminal",
    name: "Modèle National RDC - Primaire (5ème et 6ème Primaire - Préparation TENAFEP)",
    cycle: "Primaire",
    level: "6ème Primaire",
    optionName: "Enseignement Primaire Général",
    description: "Programme officiel national des 4 domaines d'apprentissage du primaire en RDC.",
    subjects: [
      { name: "Français (Grammaire, Conjugaison & Orthographe)", category: "Culture Générale", hoursPerWeek: 5, coefficient: 4, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "PRI-FRAN-G" },
      { name: "Français (Lecture, Écriture & Rédaction)", category: "Culture Générale", hoursPerWeek: 4, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "PRI-FRAN-L" },
      { name: "Mathématiques (Opérations, Numération & Problèmes)", category: "Scientifique", hoursPerWeek: 6, coefficient: 5, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "PRI-MATH-O" },
      { name: "Mathématiques (Grandeurs & Formes Géométriques)", category: "Scientifique", hoursPerWeek: 3, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "PRI-MATH-G" },
      { name: "Langues Congolaises (Swahili / Lingala)", category: "Culture Générale", hoursPerWeek: 3, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "PRI-LANG-NAT" },
      { name: "Sciences d'Éveil (Anatomie, Botanique, Hygiène & Physique)", category: "Scientifique", hoursPerWeek: 4, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "PRI-SC-EV" },
      { name: "Histoire de la RDC et de l'Afrique", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "PRI-HIST" },
      { name: "Géographie de la RDC & Univers Social", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "PRI-GEO" },
      { name: "Éducation Civique, Morale & Droits Humains", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "PRI-ECMC" },
      { name: "Technologie & Travail Manuel", category: "Professionnelle", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "PRI-TECH" },
      { name: "Éducation Physique & Sportive (EPS)", category: "Professionnelle", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "PRI-EPS" },
      { name: "Arts Plastiques & Éducation Musicale", category: "Professionnelle", hoursPerWeek: 1, coefficient: 1, isCommon: true, isOptional: true, maxPointsInterro: 10, maxPointsExamen: 20, code: "PRI-ARTS" }
    ]
  },

  // 3. SECONDAIRE - 7ème & 8ème ÉDUCATION DE BASE (EB - TRONC COMMUN)
  {
    id: "curriculum-7eb-8eb-tronc-commun",
    name: "Modèle National RDC - 7ème & 8ème Éducation de Base (EB - Tronc Commun)",
    cycle: "Secondaire",
    level: "7ème Éducation de Base",
    optionName: "Tronc Commun Éducation de Base",
    description: "Curriculum national de l'Éducation de Base préparant au Test National de Sélection et d'Orientation Scolaire et Professionnelle (TENASOSP).",
    subjects: [
      { name: "Français (Expression & Analyse de Textes)", category: "Culture Générale", hoursPerWeek: 5, coefficient: 4, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "EB-FRAN" },
      { name: "Mathématiques (Algèbre & Arithmétique)", category: "Scientifique", hoursPerWeek: 4, coefficient: 4, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "EB-MATH-ALG" },
      { name: "Mathématiques (Géométrie & Trigonométrie)", category: "Scientifique", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "EB-MATH-GEO" },
      { name: "Sciences Physiques & Technologie (PCT)", category: "Scientifique", hoursPerWeek: 3, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "EB-PHY-CHIM" },
      { name: "Sciences de la Vie et de la Terre (SVT / Biologie)", category: "Scientifique", hoursPerWeek: 3, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "EB-SVT" },
      { name: "Anglais", category: "Culture Générale", hoursPerWeek: 3, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "EB-ANG" },
      { name: "Informatique & TIC", category: "Scientifique", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "EB-INFO" },
      { name: "Histoire de la RDC et des Civilisations", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "EB-HIST" },
      { name: "Géographie Générale et de la RDC", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "EB-GEO" },
      { name: "Éducation Civique & Nouvelle Citoyenneté (ECNC)", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "EB-ECNC" },
      { name: "Éducation Physique et Sportive (EPS)", category: "Professionnelle", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "EB-EPS" },
      { name: "Dessin & Éducation Artistique", category: "Professionnelle", hoursPerWeek: 1, coefficient: 1, isCommon: true, isOptional: true, maxPointsInterro: 10, maxPointsExamen: 20, code: "EB-DESS" }
    ]
  },

  // 4. SECONDAIRE HUMANITÉS - OPTION SCIENTIFIQUE
  {
    id: "curriculum-humanites-scientifique",
    name: "Modèle National RDC - Humanités Scientifiques (Bio-Chimie / Math-Physique)",
    cycle: "Secondaire",
    level: "1ère Humanités",
    optionName: "Scientifique",
    description: "Programme officiel de la filière Scientifique avec renforcement en Mathématiques, Physique, Chimie et Biologie.",
    subjects: [
      { name: "Mathématiques Générales & Analyse", category: "Scientifique", hoursPerWeek: 6, coefficient: 5, isCommon: false, isOptional: false, maxPointsInterro: 30, maxPointsExamen: 60, code: "SEC-SC-MATH" },
      { name: "Physique & Mécanique", category: "Scientifique", hoursPerWeek: 4, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-SC-PHYS" },
      { name: "Chimie Générale & Organique", category: "Scientifique", hoursPerWeek: 4, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-SC-CHIM" },
      { name: "Biologie & Sciences de la Terre", category: "Scientifique", hoursPerWeek: 4, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-SC-BIO" },
      { name: "Informatique, Algorithmique & TIC", category: "Scientifique", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-SC-INFO" },
      { name: "Français (Littérature & Dissertation)", category: "Culture Générale", hoursPerWeek: 4, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-COM-FRAN" },
      { name: "Anglais", category: "Culture Générale", hoursPerWeek: 3, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-ANG" },
      { name: "Philosophie & Logique", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-PHIL" },
      { name: "Histoire & Géographie de la RDC", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-HG" },
      { name: "Éducation Civique & Nouvelle Citoyenneté (ECNC)", category: "Culture Générale", hoursPerWeek: 1, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-ECNC" },
      { name: "Éducation Physique et Sportive (EPS)", category: "Professionnelle", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-EPS" }
    ]
  },

  // 5. SECONDAIRE HUMANITÉS - OPTION COMMERCIALE & GESTION
  {
    id: "curriculum-humanites-commerciale",
    name: "Modèle National RDC - Humanités Commerciales & Gestion (Comptabilité / Informatique)",
    cycle: "Secondaire",
    level: "1ère Humanités",
    optionName: "Commerciale et Gestion",
    description: "Programme officiel de la filière Commerciale préparant aux métiers de gestion, comptabilité, finance et banque en RDC.",
    subjects: [
      { name: "Comptabilité Générale & Analytique", category: "Professionnelle", hoursPerWeek: 5, coefficient: 5, isCommon: false, isOptional: false, maxPointsInterro: 30, maxPointsExamen: 60, code: "SEC-COM-CPTA" },
      { name: "Arithmétique Commerciale & Mathématiques Financières", category: "Scientifique", hoursPerWeek: 4, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-COM-ARITH" },
      { name: "Économie Politique & Gestion des Entreprises", category: "Professionnelle", hoursPerWeek: 3, coefficient: 3, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-COM-ECO" },
      { name: "Droit Commercial, Civil et Droit du Travail", category: "Professionnelle", hoursPerWeek: 2, coefficient: 2, isCommon: false, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-DROIT" },
      { name: "Fiscalité & Douanes en RDC", category: "Professionnelle", hoursPerWeek: 2, coefficient: 2, isCommon: false, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-FISC" },
      { name: "Informatique de Gestion & Tableurs", category: "Scientifique", hoursPerWeek: 3, coefficient: 3, isCommon: false, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-INFOG" },
      { name: "Correspondance Commerciale & Français", category: "Culture Générale", hoursPerWeek: 4, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-COM-FRAN" },
      { name: "Anglais Commercial", category: "Culture Générale", hoursPerWeek: 3, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-ANG" },
      { name: "Géographie Économique", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-GEOEC" },
      { name: "Éducation Civique & Nouvelle Citoyenneté (ECNC)", category: "Culture Générale", hoursPerWeek: 1, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-ECNC" },
      { name: "Éducation Physique et Sportive (EPS)", category: "Professionnelle", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-COM-EPS" }
    ]
  },

  // 6. SECONDAIRE HUMANITÉS - OPTION PÉDAGOGIE GÉNÉRALE
  {
    id: "curriculum-humanites-pedagogie",
    name: "Modèle National RDC - Humanités Pédagogie Générale (Option Normale)",
    cycle: "Secondaire",
    level: "1ère Humanités",
    optionName: "Pédagogie Générale",
    description: "Programme de formation des futurs instituteurs et cadres de l'enseignement fondamental en RDC.",
    subjects: [
      { name: "Pédagogie Générale & Didactique", category: "Professionnelle", hoursPerWeek: 5, coefficient: 5, isCommon: false, isOptional: false, maxPointsInterro: 30, maxPointsExamen: 60, code: "SEC-PED-DID" },
      { name: "Psychologie de l'Enfant & de l'Adolescent", category: "Professionnelle", hoursPerWeek: 3, coefficient: 3, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-PED-PSY" },
      { name: "Méthodologie Spéciale des Branches", category: "Professionnelle", hoursPerWeek: 4, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-PED-METH" },
      { name: "Pratique de l'Enseignement & Stage Pédagogique", category: "Professionnelle", hoursPerWeek: 3, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-PED-STAGE" },
      { name: "Français & Littérature", category: "Culture Générale", hoursPerWeek: 4, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-PED-FRAN" },
      { name: "Mathématiques Générales", category: "Scientifique", hoursPerWeek: 4, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-PED-MATH" },
      { name: "Sciences Naturelles & Hygiène Scolaire", category: "Scientifique", hoursPerWeek: 3, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-PED-SN" },
      { name: "Histoire & Géographie", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-PED-HG" },
      { name: "Anglais", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-PED-ANG" },
      { name: "Dessin, Calligraphie & Travail Manuel", category: "Professionnelle", hoursPerWeek: 2, coefficient: 2, isCommon: false, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-PED-DESS" },
      { name: "Éducation Civique & ECNC", category: "Culture Générale", hoursPerWeek: 1, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-PED-ECNC" },
      { name: "Éducation Physique et Sportive (EPS)", category: "Professionnelle", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-PED-EPS" }
    ]
  },

  // 7. SECONDAIRE HUMANITÉS - OPTION LITTÉRAIRE / LATIN-PHILOSOPHIE
  {
    id: "curriculum-humanites-litteraire",
    name: "Modèle National RDC - Humanités Littéraires (Latin-Philosophie / Langues)",
    cycle: "Secondaire",
    level: "1ère Humanités",
    optionName: "Littéraire",
    description: "Filière d'excellence littéraire, philosophique, linguistique et juridique.",
    subjects: [
      { name: "Français & Littérature Universelle et Africaine", category: "Culture Générale", hoursPerWeek: 6, coefficient: 5, isCommon: false, isOptional: false, maxPointsInterro: 30, maxPointsExamen: 60, code: "SEC-LIT-FRAN" },
      { name: "Latin (Grammaire, Textes & Civilisation)", category: "Culture Générale", hoursPerWeek: 4, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-LIT-LAT" },
      { name: "Philosophie & Histoire des Idées", category: "Culture Générale", hoursPerWeek: 4, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-LIT-PHIL" },
      { name: "Langues Nationales & Linguistique Africaine", category: "Culture Générale", hoursPerWeek: 3, coefficient: 3, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-LIT-LANG" },
      { name: "Anglais Avancé", category: "Culture Générale", hoursPerWeek: 4, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-LIT-ANG" },
      { name: "Histoire Générale et de l'Afrique", category: "Culture Générale", hoursPerWeek: 3, coefficient: 3, isCommon: true, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-LIT-HIST" },
      { name: "Géographie Humaine & Politique", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-LIT-GEO" },
      { name: "Mathématiques Générales & Statistiques", category: "Scientifique", hoursPerWeek: 3, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-LIT-MATH" },
      { name: "Sciences Naturelles", category: "Scientifique", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-LIT-SN" },
      { name: "Éducation Civique & ECNC", category: "Culture Générale", hoursPerWeek: 1, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-LIT-ECNC" },
      { name: "Éducation Physique et Sportive (EPS)", category: "Professionnelle", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-LIT-EPS" }
    ]
  },

  // 8. SECONDAIRE HUMANITÉS - OPTION TECHNIQUE & INDUSTRIELLE (Électricité / Mécanique / Coupe & Couture)
  {
    id: "curriculum-humanites-technique",
    name: "Modèle National RDC - Humanités Techniques & Industrielles (Électricité / Coupe & Couture)",
    cycle: "Secondaire",
    level: "1ère Humanités",
    optionName: "Technique",
    description: "Filière professionnelle préparant aux qualifications techniques et d'ingénierie appliquée.",
    subjects: [
      { name: "Technologie Spéciale & Schémas", category: "Professionnelle", hoursPerWeek: 5, coefficient: 5, isCommon: false, isOptional: false, maxPointsInterro: 30, maxPointsExamen: 60, code: "SEC-TECH-SPEC" },
      { name: "Travaux Pratiques en Atelier & Laboratoire", category: "Professionnelle", hoursPerWeek: 6, coefficient: 5, isCommon: false, isOptional: false, maxPointsInterro: 30, maxPointsExamen: 60, code: "SEC-TECH-TP" },
      { name: "Dessin Technique Industriel & DAO", category: "Professionnelle", hoursPerWeek: 4, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-TECH-DESS" },
      { name: "Mathématiques Appliquées & Calcul Technique", category: "Scientifique", hoursPerWeek: 4, coefficient: 4, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-TECH-MATH" },
      { name: "Physique Industrielle & Mécanique Appliquée", category: "Scientifique", hoursPerWeek: 3, coefficient: 3, isCommon: false, isOptional: false, maxPointsInterro: 20, maxPointsExamen: 40, code: "SEC-TECH-PHYS" },
      { name: "Français Technique & Communication", category: "Culture Générale", hoursPerWeek: 3, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-TECH-FRAN" },
      { name: "Anglais Technique", category: "Culture Générale", hoursPerWeek: 2, coefficient: 2, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-TECH-ANG" },
      { name: "Sécurité Industrielle, Hygiène & Environnement", category: "Professionnelle", hoursPerWeek: 2, coefficient: 2, isCommon: false, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-TECH-SEC" },
      { name: "Éducation Civique & ECNC", category: "Culture Générale", hoursPerWeek: 1, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-TECH-ECNC" },
      { name: "Éducation Physique et Sportive (EPS)", category: "Professionnelle", hoursPerWeek: 2, coefficient: 1, isCommon: true, isOptional: false, maxPointsInterro: 10, maxPointsExamen: 20, code: "SEC-TECH-EPS" }
    ]
  }
];
