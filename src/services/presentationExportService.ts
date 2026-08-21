import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pptxgen from "pptxgenjs";

export interface PresentationData {
  title: string;
  subtitle: string;
  organization: string;
  author: string;
  version: string;
  date: string;
}

export const DEFAULT_PRESENTATION_DATA: PresentationData = {
  title: "SMARTSCHOOL RDC",
  subtitle: "Plateforme Intégrale de Gestion Scolaire, Pédagogique & Financière Multi-Établissements",
  organization: "FRED-TECH • République Démocratique du Congo",
  author: "Freddy Kalonda — Architecte Solution & Promoteur Tech",
  version: "Édition Nationale 2026-2027",
  date: "Année Scolaire 2026-2027"
};

export interface FeatureSection {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  keyPoints: string[];
  description: string;
  details: { title: string; desc: string }[];
  highlight: string;
  badge: string;
  color: string;
}

export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    id: "vision-multi-tenant",
    number: "01",
    title: "Architecture Multi-Tenant & Souveraineté des Données",
    subtitle: "Une infrastructure cloud souveraine conçue pour héberger des milliers d'écoles en isolation totale",
    category: "Architecture & Socle Technique",
    badge: "Cloud Hybride Résilient",
    color: "#1E40AF",
    highlight: "Isolation cryptographique stricte par identifiant d'école (schoolId) avec zéro fuite entre établissements.",
    description: "SmartSchool RDC est bâtie sur une architecture multi-tenant d'avant-garde. Chaque école (ou complexe scolaire multi-campus) dispose de son propre environnement logique étanche, tout en bénéficiant de la puissance et de la maintenance centralisée du cloud national.",
    keyPoints: [
      "Isolation complète des données : élèves, finances, personnel et cotes restent strictement privés à chaque établissement.",
      "Support multi-sites & multi-campus : gestion unifiée d'un groupe scolaire avec consolidation des rapports au niveau du Promoteur.",
      "Résilience & Mode Déconnecté : synchronisation intelligente garantissant la continuité même en cas de coupure Internet locale.",
      "Haute conformité aux directives du Ministère de l'EPST (Éducation Nationale RDC)."
    ],
    details: [
      { title: "Isolation par SchoolId", desc: "Chaque requête et enregistrement est sécurisé par un partitionnement dynamique empêchant tout accès transversal non autorisé." },
      { title: "Personnalisation complète", desc: "Chaque école intègre ses propres armoiries, devises (FC / USD), taux de change du jour et signatures officielles." },
      { title: "Sauvegarde & Redondance", desc: "Dispositif national de Disaster Recovery avec clichés automatiques et restauration instantanée en 1 clic." }
    ]
  },
  {
    id: "roles-portails",
    number: "02",
    title: "Portails Dédiés & Expérience Utilisateur par Rôle",
    subtitle: "8 espaces de travail sur mesure pour répondre aux besoins précis de chaque acteur de la communauté scolaire",
    category: "Identités & Espaces de Travail",
    badge: "8 Portails Spécifiques",
    color: "#4F46E5",
    highlight: "Routage automatique et instantané dès la connexion sans que l'utilisateur n'ait à chercher son espace.",
    description: "Fini les interfaces génériques et encombrées. SmartSchool RDC offre des portails ultra-ergonomiques adaptés à chaque profil :",
    keyPoints: [
      "Portail Promoteur / Propriétaire : Supervision exécutive globale, rentabilité multi-écoles, trésorerie et expansion.",
      "Portail Direction & Préfet des Études : Pilotage pédagogique, gestion des classes, contrôle des présences et des délibérations.",
      "Portail Enseignant : Saisie simplifiée des cotes, cahier de textes, devoirs interactifs, journal de classe et présence.",
      "Portail Élève : Consultation en temps réel des notes, devoirs, horaires, photo de profil et carte d'élève numérique.",
      "Portail Parent d'Élève : Suivi quotidien des présences, relevés de cotes, paiement des frais par Mobile Money et messagerie directe avec les professeurs.",
      "Portail Comptable & DAF : Encaissement des frais, caisse, impression des reçus thermiques sécurisés et balance financière.",
      "Portail Ressources Humaines : Dossiers du personnel, organigramme dynamique, gestion des congés et cartes de service.",
      "Portail Inspection Nationale EPST : Suivi statistique des effectifs, audit de conformité et contrôle des programmes nationaux."
    ],
    details: [
      { title: "Authentification Centralisée", desc: "Connexion universelle par e-mail, téléphone vérifié ou matricule scolaire officiel." },
      { title: "Assistant Première Connexion", desc: "Assistant sécurisé de changement obligatoire de mot de passe à l'activation du compte." },
      { title: "Notifications Contextuelles", desc: "Alertes en direct sur les retards, paiements reçus, devoirs publiés et communications urgentes." }
    ]
  },
  {
    id: "gestion-etablissements",
    number: "03",
    title: "Gestion Multi-Établissements & Configuration Scolaire",
    subtitle: "Administration complète de la maternelle aux humanités avec paramétrage fin des sections et filières",
    category: "Administration Scolaire",
    badge: "Tous Niveaux d'Enseignement",
    color: "#059669",
    highlight: "Prise en charge native de la Maternelle, du Primaire, de l'Éducation de Base (7ème & 8ème) et des Humanités.",
    description: "La plateforme s'adapte à la structure exacte de chaque école congolaise. Les administrateurs peuvent configurer en quelques clics leurs campus, sections, cycles d'études et années académiques.",
    keyPoints: [
      "Gestion des cycles complets : Maternelle, Primaire, Secondaire Général (EB) et Humanités Techniques / Pédagogiques / Scientifiques / Littéraires.",
      "Années scolaires & Clôtures : Transition académique fluide, archivage des années précédentes et réinscriptions automatiques.",
      "Identité Visuelle Officielle : Insertion du logo de l'école, de la devise, des signatures numérisées du Préfet et du sceau officiel pour les documents générés.",
      "Paramétrage Monétaire & Financier : Gestion multi-devises (USD & Francs Congolais CDF), fixation du taux de change officiel et gestion des échéanciers de frais."
    ],
    details: [
      { title: "Options & Sections RDC", desc: "Scientifique, Littéraire, Pédagogie Générale, Commerciale & Gestion, Mécanique, Électricité, Nutrition, etc." },
      { title: "Salles & Capacités", desc: "Gestion des salles de classe, des effectifs maximums et prévention des sureffectifs." },
      { title: "Assistant d'Initialisation", desc: "Création assistée d'une nouvelle école en 3 étapes avec génération automatique des classes standards." }
    ]
  },
  {
    id: "eleves-inscriptions",
    number: "04",
    title: "Gestion des Élèves, Inscriptions & Matricules Uniques",
    subtitle: "Dossier scolaire numérique 360°, fiches d'inscription, matricules officiels et gestion des photos d'identité",
    category: "Vie Scolaire & Registre",
    badge: "Matricule Unique Anti-Fraude",
    color: "#D97706",
    highlight: "Génération automatique d'un matricule scolaire officiel unique et cartes d'accès avec QR code sécurisé.",
    description: "Le registre des élèves centralise l'intégralité du parcours académique, administratif et médical de chaque apprenant.",
    keyPoints: [
      "Fiche d'identification complète : Nom, post-nom, prénom, date et lieu de naissance, genre, groupe sanguin, coordonnées des parents et tuteurs.",
      "Matricule Unique & Permanent : Attribution automatique d'un numéro matricule national garantissant la traçabilité de l'élève.",
      "Gestion des Photos d'Identité : Téléversement direct depuis la galerie ou la caméra, recadrage optimisé et synchronisation sur tous les badges.",
      "Historique Académique & Mutations : Suivi des réinscriptions annuelles, des transferts d'établissement et conservation de l'historique complet.",
      "Génération des fiches de connexion : Création instantanée des fiches individuelles avec identifiants et mot de passe temporaire à remettre aux parents."
    ],
    details: [
      { title: "Import / Export Excel", desc: "Import massif des effectifs depuis des fichiers Excel et export universel certifié." },
      { title: "Filtres & Recherches Avancées", desc: "Recherche instantanée par classe, option, genre, statut de paiement ou numéro matricule." },
      { title: "Listes Officielles pour l'EPST", desc: "Impression en un clic des listes officielles pour l'Inspection et les Examens d'État (Exétat)." }
    ]
  },
  {
    id: "rh-personnel",
    number: "05",
    title: "Ressources Humaines, Organigramme & Cartes de Service",
    subtitle: "Gestion moderne du corps professoral et du personnel administratif avec badges professionnels QR",
    category: "Ressources Humaines & Paie",
    badge: "Organigramme Dynamique",
    color: "#7C3AED",
    highlight: "Génération de cartes de service professionnelles haute sécurité avec QR code de vérification instantanée.",
    description: "Le module RH structure l'organisation humaine de l'école : recrutement, affectations de cours, suivi des contrats, évaluation des performances et fiches de paie.",
    keyPoints: [
      "Registre du Personnel : Fiches individuelles pour enseignants, surveillants, comptables, secrétaires et personnel de direction.",
      "Organigramme Hiérarchique Interactif : Visualisation claire de la chaîne de commandement et des responsabilités de l'établissement.",
      "Affectations Pédagogiques : Association précise des enseignants aux cours, classes et volumes horaires hebdomadaires.",
      "Cartes de Service Professionnelles : Édition et impression de cartes de service élégantes aux normes nationales avec QR code d'authentification.",
      "Gestion des Absences & Congés : Suivi des demandes de congés, des remplacements et journal d'audit des mouvements du personnel."
    ],
    details: [
      { title: "Gestion des Fonctions & Titres", desc: "Définition précise des grades : Préfet, Directeur des études, Directeur de discipline, Enseignant titulaire, Caissier..." },
      { title: "Sécurité & Comptes Associés", desc: "Activation automatique du compte d'accès dès l'enregistrement de l'employé avec contrôle des privilèges." },
      { title: "Historique des Responsabilités", desc: "Traçabilité des transferts de charge et des promotions au sein de l'école." }
    ]
  },
  {
    id: "finances-mobile-money",
    number: "06",
    title: "Finances, Caisse & Paiements Mobile Money RDC",
    subtitle: "Digitalisation des encaissements de frais scolaires avec intégration native M-Pesa, Orange Money et Airtel Money",
    category: "Gestion Financière & Comptable",
    badge: "Mobile Money & Caisse Sécurisée",
    color: "#059669",
    highlight: "Zéro risque de manipulation d'espèces grâce au paiement direct par téléphone et validation en temps réel.",
    description: "SmartSchool RDC révolutionne le recouvrement des frais scolaires (minerval, frais d'examen, transport, cantine, internat) en République Démocratique du Congo.",
    keyPoints: [
      "Intégration Mobile Money Directe : Les parents peuvent payer instantanément via Vodacom M-Pesa, Orange Money ou Airtel Money.",
      "Paiements au Guichet & Caisse : Enregistrement rapide des règlements en espèces ou virements bancaires avec émission de reçus numérotés.",
      "Reçus Thermiques & Format A4 : Impression instantanée de reçus au format ticket de caisse (80mm) ou feuille A4 avec QR code anti-fraude.",
      "Gestion des Échéanciers & Tranches : Définition des acomptes, dates limites de paiement et relances automatiques pour les impayés.",
      "Tableau de Bord Comptable : Suivi en temps réel du taux de recouvrement, journal des encaissements, solde de caisse et grand livre."
    ],
    details: [
      { title: "Conditionnement des Bulletins", desc: "Option de blocage automatique de l'accès au bulletin de l'élève en cas de non-apurement des frais de la période." },
      { title: "Audit & Rapprochement Bancaire", desc: "Journal d'audit inaltérable de chaque centime perçu avec identité de l'agent caissier." },
      { title: "Statistiques Financières", desc: "Graphiques d'évolution des recettes, analyse comparative par classe et prévisions de trésorerie." }
    ]
  },
  {
    id: "presences-absences",
    number: "07",
    title: "Suivi des Présences, Pointage & Alertes Instantanées",
    subtitle: "Contrôle d'assiduité quotidien en classe avec notification immédiate des parents par SMS et messagerie",
    category: "Discipline & Assiduité",
    badge: "Alertes Parents par SMS",
    color: "#DC2626",
    highlight: "Les parents sont informés dans la minute en cas d'absence non justifiée ou de retard répété de leur enfant.",
    description: "Le système de présence numérique élimine les registres papier et renforce la sécurité des élèves entre leur domicile et l'école.",
    keyPoints: [
      "Appel Numérique en 1 Clic : L'enseignant ou le surveillant effectue l'appel sur smartphone, tablette ou ordinateur en début de cours.",
      "Catégorisation des Statuts : Présent, Absent non justifié, Absent justifié (certificat médical), En retard, Exclu temporaire.",
      "Alertes Automatiques aux Parents : Envoi instantané d'une alerte dès qu'une absence est constatée pour éviter toute dérive.",
      "Justification des Absences : Saisie administrative des motifs d'absence avec archivage numérique des justificatifs.",
      "Statistiques & Ratios de Ponctualité : Détection précoce du décrochage et calcul automatique des points de conduite sur le bulletin."
    ],
    details: [
      { title: "Pointage par QR Code", desc: "Possibilité de scanner la carte de l'élève à la porte d'entrée de l'école pour enregistrer l'heure exacte d'arrivée." },
      { title: "Synthèse Périodique", desc: "Récapitulatif des heures d'absence pour la délibération et le conseil de classe." },
      { title: "Suivi des Présences Enseignants", desc: "Module complémentaire pour suivre la ponctualité des enseignants et le respect des volumes horaires." }
    ]
  },
  {
    id: "notes-bulletins-epst",
    number: "08",
    title: "Cotes, Délibérations & Bulletins Officiels EPST",
    subtitle: "Génération conforme des bulletins scolaires officiels de la RDC avec calculs automatiques et sceaux sécurisés",
    category: "Pédagogie & Évaluations",
    badge: "100% Conforme Normes EPST",
    color: "#2563EB",
    highlight: "Calcul automatique des totaux, pourcentages, classements, mentions et délibération de passage de classe sans erreur humaine.",
    description: "SmartSchool RDC intègre le canevas exact du Bulletin Officiel du Ministère de l'Enseignement Primaire, Secondaire et Technique (EPST) de la RDC.",
    keyPoints: [
      "Saisie des Cotes Intuitive : Grilles de saisie pour interrogations, devoirs, travaux pratiques et examens semestriels.",
      "Structure Officielle 4 Périodes + 2 Examens : Calcul des maxima, totaux de périodes, totaux semestriels et total général annuel.",
      "Délibération & Conseils de Classe : Détermination automatique des mentions (Grande Distinction, Distinction, Satisfaction, Ajourné, Refusé).",
      "Édition Graphique Haute Fidélité : Impression des bulletins avec filigrane officiel, drapeau national de la RDC, logo de l'école et signatures numériques.",
      "Palmarès d'Excellence & Tableaux d'Honneur : Classement automatique des meilleurs élèves par promotion et par option."
    ],
    details: [
      { title: "Appréciations & Conduite", desc: "Attribution des notes de conduite et commentaires personnalisés du titulaire et du Préfet des études." },
      { title: "Sécurité & Anti-Falsification", desc: "Chaque bulletin intègre un QR code unique permettant à un inspecteur ou une université de vérifier son authenticité en ligne." },
      { title: "Export des Résultats", desc: "Génération instantanée en PDF vectoriel pour impression de masse ou téléchargement direct par les parents." }
    ]
  },
  {
    id: "vie-scolaire-journal-devoirs",
    number: "09",
    title: "Vie Scolaire, Journal de Classe & Devoirs en Ligne",
    subtitle: "Prolongement de la classe à la maison avec cahier de textes numérique et suivi des travaux à domicile",
    category: "Vie Scolaire & Pédagogie",
    badge: "Continuité Pédagogique",
    color: "#0891B2",
    highlight: "Les élèves et leurs parents consultent chaque soir les leçons du jour, les résumés et les devoirs à rendre.",
    description: "Ce module modernise le traditionnel journal de classe en offrant un pont numérique interactif entre l'école et la maison.",
    keyPoints: [
      "Journal de Classe Quotidien : Enregistrement de la matière vue en classe par chaque professeur avec objectifs pédagogiques.",
      "Cahier de Devoirs Interactif : Publication des devoirs, consignes, pièces jointes (PDF, documents) et dates limites de remise.",
      "Rappels Automatiques : Les élèves et parents reçoivent des notifications avant la date d'échéance d'un travail à rendre.",
      "Ressources Pédagogiques : Partage de fiches de révision, exercices d'entraînement et manuels scolaires numériques.",
      "Galerie d'Événements Scolaires : Valorisation de la vie parascolaire, excursions, remises de prix et cérémonies de collation des grades."
    ],
    details: [
      { title: "Validation par la Direction", desc: "Le Directeur des Études peut superviser et valider le contenu des cours dispensés quotidiennement." },
      { title: "Accessibilité Mobile", desc: "Interface fluide et légère, accessible depuis n'importe quel smartphone même avec une connexion 3G/4G modeste." },
      { title: "Rétroaction Enseignant", desc: "Possibilité pour l'enseignant de corriger et d'annoter les devoirs soumis par les élèves." }
    ]
  },
  {
    id: "emplois-du-temps",
    number: "10",
    title: "Emplois du Temps Intelligents & Planification",
    subtitle: "Générateur dynamique d'emplois du temps avec détection automatique des conflits de salles et d'enseignants",
    category: "Organisation Pédagogique",
    badge: "Algorithme Anti-Conflits",
    color: "#4338CA",
    highlight: "Élimination des chevauchements d'horaires et optimisation automatique de l'utilisation des salles de classe.",
    description: "Planifier les emplois du temps de dizaines de classes et d'enseignants devient un jeu d'enfant grâce au planificateur pédagogique intégré.",
    keyPoints: [
      "Grille Hebdomadaire Intuitive : Vue par classe, par enseignant ou par salle de cours avec code couleur par discipline.",
      "Détection Intelligente des Conflits : Alertes immédiates si un enseignant ou une salle est assigné deux fois au même créneau horaire.",
      "Prise en compte des Contraintes : Disponibilités des professeurs, volumes horaires hebdomadaires officiels et pauses récréatives.",
      "Publication & Impression Instantanée : Diffusion de l'horaire aux élèves et enseignants en format grille imprimable A4.",
      "Gestion des Remplacements : Réaffectation rapide en cas d'absence d'un professeur avec notification aux élèves concernés."
    ],
    details: [
      { title: "Conformité aux Grilles Horaires EPST", desc: "Respect strict des quotas d'heures par matière selon les directives des programmes nationaux." },
      { title: "Gestion des Laboratoires & Ateliers", desc: "Réservation dédiée pour les salles d'informatique, laboratoires de sciences et ateliers techniques." },
      { title: "Export Numérique", desc: "Export en PDF et synchronisation directe dans les portails élèves et professeurs." }
    ]
  },
  {
    id: "messagerie-communications",
    number: "11",
    title: "Messagerie Sécurisée & Communications Établissement",
    subtitle: "Canal de discussion interne et diffusion d'annonces officielles sans recourir à des réseaux sociaux externes non sécurisés",
    category: "Communication & Échanges",
    badge: "Canal Éducatif Sécurisé",
    color: "#0D9488",
    highlight: "Discussions encadrées et traçables garantissant la protection des mineurs et la confidentialité des échanges.",
    description: "SmartSchool RDC fournit une plateforme de messagerie professionnelle interne reliant toute la communauté éducative.",
    keyPoints: [
      "Canaux de Discussion Ciblés : Échanges directs entre parents et professeurs titulaires pour le suivi individuel de l'élève.",
      "Circulaires & Annonces Officielles : Diffusion instantanée de communiqués de la Direction à destination de toutes les familles ou de classes ciblées.",
      "Chat Inter-Personnel : Messagerie collaborative entre collègues enseignants et administration pour la coordination pédagogique.",
      "Historique & Confidentialité : Sauvegarde sécurisée des échanges sans partage des numéros de téléphone personnels des enseignants.",
      "Notifications Push & Alertes : Avertissement immédiat sur l'application dès réception d'un nouveau message important."
    ],
    details: [
      { title: "Modération & Archivage", desc: "Respect des règles de déontologie scolaire et traçabilité pour la Direction en cas de besoin." },
      { title: "Partage de Pièces Jointes", desc: "Transmission sécurisée de documents administratifs, convocations et fiches de renseignements." },
      { title: "Protection de la Vie Privée", desc: "Préservation stricte des données personnelles des élèves et des éducateurs." }
    ]
  },
  {
    id: "intelligence-artificielle",
    number: "12",
    title: "Intelligence Artificielle & Smart Analytics (Gemini AI)",
    subtitle: "Analyses prédictives, détection précoce du décrochage scolaire et assistant pédagogique intelligent pour les directeurs",
    category: "Innovation & Décisionnel",
    badge: "Moteur IA Gemini Intégré",
    color: "#6366F1",
    highlight: "L'IA analyse les corrélations entre présences, cotes et finances pour guider les décisions stratégiques du Préfet.",
    description: "SmartSchool RDC intègre la puissance des modèles Gemini de Google pour doter les écoles d'un véritable assistant de direction et d'analyse prédictive.",
    keyPoints: [
      "Smart AI Analyst de Direction : Synthèse automatique de la santé globale de l'école (performance académique, taux de recouvrement, assiduité).",
      "Détection Précoce du Risque de Décrochage : Identification des élèves en difficulté avant les examens finaux pour déclencher un tutorat préventif.",
      "Générateur d'Évaluations & Plans de Cours : Aide aux enseignants pour formuler des questionnaires d'examen et des fiches pédagogiques.",
      "Recommandations Stratégiques Personnalisées : Conseils sur mesure pour optimiser les plannings et améliorer la réussite aux épreuves nationales.",
      "Assistant Conversationnel Dédié : Réponse instantanée aux questions des directeurs sur les statistiques et les règlements scolaires."
    ],
    details: [
      { title: "Analyse Multi-Critères", desc: "Croisement intelligent des notes, de l'historique d'absences et de l'implication des parents." },
      { title: "Respect de l'Éthique", desc: "L'IA assiste l'éducateur humain sans jamais prendre de décision automatisée pénalisante." },
      { title: "Tableaux de Bord Graphiques", desc: "Visualisation synthétique des indicateurs clés pour les conseils d'administration et promoteurs." }
    ]
  },
  {
    id: "documents-cartes-officiels",
    number: "13",
    title: "Centre d'Édition & Documents Officiels Imprimables",
    subtitle: "Génération instantanée de toutes les pièces scolaires officielles avec QR codes d'authentification et charte graphique",
    category: "Édition & Impression",
    badge: "Documents Haute Sécurité",
    color: "#0284C7",
    highlight: "Plus de 15 formats de documents scolaires générés en un clic prêts à être imprimés ou envoyés au format PDF.",
    description: "Le centre d'impression officiel de SmartSchool RDC automatise la production de tous les documents réglementaires scolaires.",
    keyPoints: [
      "Cartes d'Élèves Haute Qualité : Format carte bancaire ou badge plastifié avec photo HD, code-barres/QR code et armoiries scolaires.",
      "Cartes de Service du Personnel : Badges professionnels pour le corps enseignant et l'administration avec mention de la fonction.",
      "Bulletins Scolaires Officiels RDC : Bulletins semestriels et annuels complets avec tableau des cotes, conduite et signatures certifiées.",
      "Reçus de Paiement Thermiques & A4 : Preuves de paiement numérotées avec détail des tranches réglées et solde restant.",
      "Attestations de Fréquentation & de Réussite : Certificats officiels générés automatiquement pour les démarches administratives et consulaires.",
      "Fiches d'Accès & Mots de Passe : Fiches individuelles imprimables pour la distribution des identifiants aux élèves et parents.",
      "Palmarès Officiels & Grilles de Délibération : Tableaux récapitulatifs complets pour les archives et l'Inspection de l'EPST."
    ],
    details: [
      { title: "QR Code d'Authenticité", desc: "Chaque document imprimé porte un code sécurisé permettant une vérification en ligne immédiate de son intégrité." },
      { title: "Préréglages d'Impression", desc: "Compatible avec imprimantes laser de bureau, imprimantes thermiques de caisse et imprimantes à badges PVC." },
      { title: "Export Vectoriel PDF", desc: "Rendu vectoriel d'une netteté absolue sans pixellisation des textes ou des logos." }
    ]
  },
  {
    id: "securite-iam-backups",
    number: "14",
    title: "Sécurité, IAM, Sauvegardes & Disaster Recovery",
    subtitle: "Protection des données de niveau bancaire, contrôle d'accès strict (RBAC) et centre de sauvegarde national",
    category: "Cybersécurité & Continuité",
    badge: "Sécurité & Zéro-Trust",
    color: "#1E293B",
    highlight: "Chiffrement de bout en bout et politique stricte du moindre privilège garantissant l'inviolabilité des dossiers scolaires.",
    description: "La protection des données des élèves et la sécurité financière constituent la priorité absolue de l'architecture SmartSchool RDC.",
    keyPoints: [
      "Gestion des Identités et Accès (IAM) : Contrôle d'accès basé sur les rôles (RBAC) interdisant toute action non autorisée.",
      "Authentification Firebase Sécurisée : Protection contre les attaques par force brute, gestion des sessions et expiration automatique.",
      "Journal d'Audit Inaltérable : Enregistrement de chaque action sensible (création d'élève, modification de note, encaissement financier).",
      "Centre National de Sauvegarde & Disaster Recovery : Sauvegardes automatisées quotidiennes sur des serveurs sécurisés et résilients.",
      "Corbeille & Récupération Sécurisée : Protection contre les suppressions accidentelles avec possibilité de restauration par le Promoteur."
    ],
    details: [
      { title: "Conformité Légale RDC", desc: "Respect des réglementations sur la protection de la vie privée et des données scolaires des mineurs." },
      { title: "Supervision Serveurs en Temps Réel", desc: "Monitoring continu de la bande passante, des temps de réponse et de la disponibilité du système (99.9% d'uptime)." },
      { title: "Double Facteur (2FA)", desc: "Possibilité de sécurisation renforcée pour les comptes de direction et de comptabilité." }
    ]
  },
  {
    id: "inspection-nationale",
    number: "15",
    title: "Module d'Inspection Nationale de l'EPST",
    subtitle: "Outil de gouvernance et de régulation pour les inspecteurs provinciaux et nationaux de l'Éducation Nationale",
    category: "Régulation & Inspection EPST",
    badge: "Supervision EPST",
    color: "#B45309",
    highlight: "Visibilité statistique consolidée sur les ratios élèves/enseignants, taux de réussite et respect des programmes officiels.",
    description: "SmartSchool RDC fournit une passerelle institutionnelle dédiée aux inspecteurs et autorités du Ministère de l'EPST pour faciliter le contrôle et la supervision des écoles.",
    keyPoints: [
      "Registre National des Établissements : Cartographie des écoles agréées, des campus, des options organisées et des effectifs réels.",
      "Missions d'Inspection Numériques : Planification, rapports de visite pédagogique et grille d'évaluation des enseignants.",
      "Circulaires & Directives Ministérielles : Publication et diffusion immédiate des circulaires officielles auprès de tous les chefs d'établissement.",
      "Référentiels Pédagogiques Nationaux (CNR) : Centralisation des programmes officiels, grilles d'évaluation et épreuves types de l'Examen d'État.",
      "Tableau de Bord Statistique Régional : Comparaison des performances par province éducationnelle et détection des zones nécessitant un appui."
    ],
    details: [
      { title: "Rapports d'Audit E01", desc: "Génération automatique des formulaires réglementaires de rentrée et de fin d'année pour l'inspection." },
      { title: "Transparence & Traçabilité", desc: "Lutte efficace contre les fausses attestations et les doublons d'élèves grâce aux matricules uniques." },
      { title: "Valorisation du Patrimoine", desc: "Module culturel intégré valorisant le patrimoine historique et civique congolais." }
    ]
  },
  {
    id: "deploiement-commercial",
    number: "16",
    title: "Modèle de Déploiement, Accompagnement & Contact",
    subtitle: "Mise en service rapide, formation des équipes sur site et tarification adaptée aux réalités congolaises",
    category: "Partenariat & Déploiement",
    badge: "Accompagnement Clé en Main",
    color: "#1E40AF",
    highlight: "Déploiement opérationnel d'une école en moins de 48 heures avec formation complète de la Direction et des enseignants.",
    description: "FRED-TECH propose un modèle d'accompagnement de proximité pour assurer la réussite de la transformation numérique de chaque école partenaire.",
    keyPoints: [
      "Mise en service express : Importation des données existantes (élèves, enseignants, classes) et paramétrage personnalisé en 48h.",
      "Formation sur Site & à Distance : Sessions pratiques dédiées pour les directeurs, comptables, secrétaires et corps enseignant.",
      "Support Technique Dédié 24/7 : Assistance téléphonique locale par WhatsApp et prise en main à distance en cas de besoin.",
      "Formule SaaS Accessible : Abonnement flexible par élève ou forfait annuel tout compris sans investissement lourd en matériel serveur.",
      "Évolutivité Continue : Mises à jour automatiques gratuites intégrant les nouvelles directives du Ministère de l'EPST."
    ],
    details: [
      { title: "Partenaire Officiel", desc: "FRED-TECH par Freddy Kalonda — Concepteur & Éditeur Logiciel National" },
      { title: "Contact Commercial", desc: "Email: contact@fred-technique.cd | Hotline: +243 820 000 000 | Kinshasa, RDC" },
      { title: "Démonstration Gratuite", desc: "Accès immédiat à la plateforme de démonstration interactive avec données de test pré-configurées." }
    ]
  }
];

/**
 * Service de génération de la plaquette officielle en PDF
 */
export async function generatePresentationPdf(data: PresentationData = DEFAULT_PRESENTATION_DATA): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper colors
  const primaryBlue = [30, 64, 175]; // #1E40AF
  const darkNavy = [15, 23, 42]; // #0F172A
  const accentGold = [217, 119, 6]; // #D97706
  const emeraldGreen = [5, 150, 105]; // #059669
  const slateGray = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC

  // ==========================================
  // PAGE 1 : COUVERTURE OFFICIELLE HAUT DE GAMME
  // ==========================================
  
  // Background gradient-like block
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top banner accent
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Gold separator line
  doc.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.rect(0, 28, pageWidth, 2.5, "F");

  // Banner text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • MINISTÈRE DE L'EPST", pageWidth / 2, 12, { align: "center" });
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 230, 255);
  doc.text("PLATEFORME NUMÉRIQUE HOMOLOGUÉE POUR LA GESTION ET L'INSPECTION SCOLAIRE", pageWidth / 2, 19, { align: "center" });

  // Center Badge Logo Graphic
  const logoCenterY = 70;
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.circle(pageWidth / 2, logoCenterY, 26, "F");
  doc.setDrawColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.setLineWidth(1.5);
  doc.circle(pageWidth / 2, logoCenterY, 27.5, "S");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SMART", pageWidth / 2, logoCenterY - 3, { align: "center" });
  doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.setFontSize(14);
  doc.text("SCHOOL", pageWidth / 2, logoCenterY + 4, { align: "center" });
  doc.setTextColor(180, 220, 255);
  doc.setFontSize(8);
  doc.text("RDC • FRED-TECH", pageWidth / 2, logoCenterY + 11, { align: "center" });

  // Main Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("SMARTSCHOOL RDC", pageWidth / 2, 120, { align: "center" });

  doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.setFontSize(12);
  doc.text("LA SOLUTION INTÉGRALE DE GESTION SCOLAIRE & MULTI-TENANT", pageWidth / 2, 128, { align: "center" });

  // Subtitle in framed box
  doc.setFillColor(25, 38, 65);
  doc.roundedRect(20, 138, pageWidth - 40, 28, 4, 4, "F");
  doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(20, 138, pageWidth - 40, 28, 4, 4, "S");

  doc.setTextColor(240, 245, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Dossier de Présentation Officielle, Commerciale & Technique", pageWidth / 2, 148, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(190, 205, 230);
  doc.text("Destiné aux Établissements Scolaires, Promoteurs, Préfets des Études, DAF et Partenaires Éducatifs", pageWidth / 2, 157, { align: "center" });

  // Feature Highlights Box
  const featY = 178;
  doc.setFillColor(18, 28, 48);
  doc.roundedRect(20, featY, pageWidth - 40, 56, 3, 3, "F");

  doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("POINTS CLÉS DE LA PLATEFORME :", 28, featY + 9);

  const pillars = [
    "✓ Architecture Multi-Tenant avec isolation totale et souveraineté des données",
    "✓ 8 Portails dédiés : Promoteur, Direction, Enseignants, Élèves, Parents, DAF, RH, EPST",
    "✓ Bulletins Officiels RDC conformes EPST avec délibération automatique et QR code",
    "✓ Finances & Caisse avec intégration native Mobile Money (M-Pesa, Orange, Airtel)",
    "✓ Présences en direct avec alertes immédiates aux parents par SMS / WhatsApp",
    "✓ Moteur d'Intelligence Artificielle Gemini pour la détection du décrochage et l'analyse"
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(230, 240, 255);
  pillars.forEach((p, idx) => {
    doc.text(p, 28, featY + 17 + (idx * 6.2));
  });

  // Footer Cover
  doc.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.rect(0, pageHeight - 32, pageWidth, 1.5, "F");

  doc.setFillColor(10, 16, 30);
  doc.rect(0, pageHeight - 30.5, pageWidth, 30.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("ÉDITÉ PAR FRED-TECH • CONCEPTEUR & ÉDITEUR LOGICIEL NATIONAL", pageWidth / 2, pageHeight - 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 195, 220);
  doc.text("Freddy Kalonda — Promoteur & Architecte Système | Kinshasa, RDC | contact@fred-technique.cd", pageWidth / 2, pageHeight - 13, { align: "center" });
  doc.text("Version Nationale 2026-2027 • Dépôt Légal et Droits Réservés", pageWidth / 2, pageHeight - 7, { align: "center" });

  // ==========================================
  // PAGE 2 : SOMMAIRE & PRÉSENTATION STRATÉGIQUE
  // ==========================================
  doc.addPage();
  renderHeader(doc, "SMARTSCHOOL RDC — DOSSIER OFFICIEL", "SOMMAIRE EXÉCUTIF", 2);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text("Sommaire Exécutif du Document", 15, 34);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text("Retrouvez ci-dessous la cartographie complète des capacités opérationnelles et modules de SmartSchool RDC.", 15, 40);

  // Table of contents grid
  const half = Math.ceil(FEATURE_SECTIONS.length / 2);
  const leftSections = FEATURE_SECTIONS.slice(0, half);
  const rightSections = FEATURE_SECTIONS.slice(half);

  const drawTocColumn = (sections: FeatureSection[], startX: number, startY: number) => {
    let currY = startY;
    sections.forEach((sec) => {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.roundedRect(startX, currY, 86, 20, 2, 2, "F");
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.roundedRect(startX, currY, 86, 20, 2, 2, "S");

      // Number badge
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.roundedRect(startX + 2.5, currY + 3.5, 9, 13, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(sec.number, startX + 7, currY + 11.5, { align: "center" });

      // Title
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      const splitTitle = doc.splitTextToSize(sec.title, 68);
      doc.text(splitTitle[0] || sec.title, startX + 14, currY + 8);

      // Category badge text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text(sec.category, startX + 14, currY + 14);

      currY += 23;
    });
  };

  drawTocColumn(leftSections, 15, 47);
  drawTocColumn(rightSections, 108, 47);

  // Strategic Vision Box at bottom of Page 2
  const visionY = 236;
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.roundedRect(15, visionY, pageWidth - 30, 38, 3, 3, "F");

  doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("NOTRE MISSION ENVERS LE SYSTÈME ÉDUCATIF DE LA RDC :", 22, visionY + 8);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const visionText = "Moderniser l'école congolaise en offrant une plateforme unifiée, intuitive et souveraine qui garantit la rigueur administrative, la transparence financière et l'excellence pédagogique, sans dépendance vis-à-vis d'infrastructures étrangères complexes.";
  const splitVision = doc.splitTextToSize(visionText, pageWidth - 44);
  doc.text(splitVision, 22, visionY + 16);

  renderFooter(doc, 2);

  // ==========================================
  // PAGES SUIVANTES : DÉTAIL COMPLET PAR SECTION (2 SECTIONS PAR PAGE)
  // ==========================================
  let pageNumber = 3;

  for (let i = 0; i < FEATURE_SECTIONS.length; i += 2) {
    doc.addPage();
    const sec1 = FEATURE_SECTIONS[i];
    const sec2 = FEATURE_SECTIONS[i + 1];

    renderHeader(doc, "SMARTSCHOOL RDC — MODULES & FONCTIONNALITÉS", `${sec1.number} & ${sec2 ? sec2.number : ""}`, pageNumber);

    renderSectionBlock(doc, sec1, 30);
    if (sec2) {
      renderSectionBlock(doc, sec2, 155);
    }

    renderFooter(doc, pageNumber);
    pageNumber++;
  }

  // ==========================================
  // DERNIÈRE PAGE : MATRICE COMPARATIVE & CONTACT
  // ==========================================
  doc.addPage();
  renderHeader(doc, "SMARTSCHOOL RDC — GUIDE COMMERCIAL", "SYNTHÈSE & DÉPLOIEMENT", pageNumber);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text("Tableau Récapitulatif des Capacités par Profil", 15, 34);

  // Comparison Matrix using jspdf-autotable
  autoTable(doc, {
    startY: 40,
    head: [["Module / Fonctionnalité", "Direction", "Enseignants", "Parents", "Élèves", "Comptable", "RH", "EPST"]],
    body: [
      ["Tableau de bord & KPIs", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
      ["Inscriptions & Matricules", "✓", "—", "—", "—", "—", "—", "✓"],
      ["Saisie des cotes & bulletins", "✓", "✓", "—", "—", "—", "—", "✓"],
      ["Consultation notes & devoirs", "✓", "✓", "✓", "✓", "—", "—", "✓"],
      ["Paiement Mobile Money & Caisse", "✓", "—", "✓", "—", "✓", "—", "—"],
      ["Reçus thermiques & grand livre", "✓", "—", "—", "—", "✓", "—", "—"],
      ["Pointage & alertes absences SMS", "✓", "✓", "✓", "—", "—", "✓", "—"],
      ["Journal de classe & devoirs", "✓", "✓", "✓", "✓", "—", "—", "—"],
      ["Emplois du temps automatiques", "✓", "✓", "✓", "✓", "—", "—", "—"],
      ["Messagerie interne sécurisée", "✓", "✓", "✓", "✓", "✓", "✓", "—"],
      ["Smart AI Analyst (Gemini)", "✓", "✓", "—", "—", "—", "—", "✓"],
      ["Cartes d'élèves & de service QR", "✓", "—", "—", "✓", "—", "✓", "✓"],
      ["Sauvegardes & Disaster Recovery", "✓", "—", "—", "—", "—", "—", "✓"],
      ["Supervision & Audit Provincial", "—", "—", "—", "—", "—", "—", "✓"]
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" }
    }
  });

  const lastTableY = (doc as any).lastAutoTable.finalY || 160;

  // Contact and Call to Action block
  const contactY = lastTableY + 10;
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.roundedRect(15, contactY, pageWidth - 30, 72, 3, 3, "F");

  doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("COMMENCEZ LA TRANSFORMATION NUMÉRIQUE DE VOTRE ÉCOLE :", 22, contactY + 11);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Notre équipe d'ingénieurs et de conseillers pédagogiques est à votre entière disposition pour :", 22, contactY + 20);
  doc.text("• Une démonstration en direct sur votre site ou en visioconférence", 25, contactY + 28);
  doc.text("• Un audit gratuit de vos besoins informatiques et de connectivité", 25, contactY + 35);
  doc.text("• La configuration personnalisée de votre établissement en moins de 48 heures", 25, contactY + 42);

  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.roundedRect(22, contactY + 49, pageWidth - 44, 16, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CONTACT OFFICIEL FRED-TECH :", 28, contactY + 56);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Téléphone / WhatsApp: +243 820 000 000  |  Email: contact@fred-technique.cd  |  Kinshasa, RDC", 28, contactY + 62);

  renderFooter(doc, pageNumber);

  // Save the PDF
  doc.save("SmartSchool_RDC_Presentation_Officielle.pdf");
}

/**
 * Service de génération de la présentation PowerPoint (.pptx)
 */
export async function generatePresentationPptx(data: PresentationData = DEFAULT_PRESENTATION_DATA): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = data.author;
  pptx.company = "SmartSchool RDC • FRED-TECH";
  pptx.title = "SmartSchool RDC — Présentation Officielle Commerciale & Technique";
  pptx.subject = "Solution Intégrale de Gestion Scolaire Multi-Tenant";

  const primaryBlue = "1E40AF";
  const darkNavy = "0F172A";
  const accentGold = "D97706";
  const emeraldGreen = "059669";
  const slateGray = "64748B";
  const lightBg = "F8FAFC";
  const white = "FFFFFF";

  // ==========================================
  // SLIDE 1 : COUVERTURE
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: darkNavy };

  // Top header bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.6,
    fill: { color: primaryBlue }
  });

  slide1.addText("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • MINISTÈRE DE L'EPST", {
    x: 0,
    y: 0.12,
    w: "100%",
    h: 0.35,
    align: "center",
    color: white,
    fontSize: 11,
    bold: true,
    fontFace: "Arial"
  });

  // Gold separator
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0.6,
    w: "100%",
    h: 0.08,
    fill: { color: accentGold }
  });

  // Main Title & Subtitle
  slide1.addText("SMARTSCHOOL RDC", {
    x: 0.8,
    y: 1.6,
    w: 8.5,
    h: 0.9,
    color: white,
    fontSize: 36,
    bold: true,
    fontFace: "Arial"
  });

  slide1.addText("LA SOLUTION INTÉGRALE DE GESTION SCOLAIRE & MULTI-TENANT", {
    x: 0.8,
    y: 2.5,
    w: 11.5,
    h: 0.5,
    color: accentGold,
    fontSize: 16,
    bold: true,
    fontFace: "Arial"
  });

  slide1.addText("Dossier de Présentation Officielle, Commerciale & Technique pour Établissements, Promoteurs, Préfets et Partenaires Éducatifs", {
    x: 0.8,
    y: 3.1,
    w: 10.5,
    h: 0.7,
    color: "CBD5E1",
    fontSize: 13,
    fontFace: "Arial"
  });

  // Key Value Proposition Cards on Cover
  const coverKpis = [
    { title: "Multi-Tenant & Étanche", desc: "Isolation stricte par école", color: primaryBlue },
    { title: "8 Portails Métiers", desc: "Direction, Enseignants, Parents...", color: "4F46E5" },
    { title: "Bulletins EPST Officiels", desc: "Conformes à 100% avec QR code", color: emeraldGreen },
    { title: "Mobile Money Intégré", desc: "M-Pesa, Orange, Airtel", color: accentGold }
  ];

  coverKpis.forEach((kpi, idx) => {
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: 0.8 + (idx * 2.8),
      y: 4.1,
      w: 2.6,
      h: 1.4,
      fill: { color: "1E293B" },
      line: { color: kpi.color, width: 2 }
    });

    slide1.addText(kpi.title, {
      x: 0.9 + (idx * 2.8),
      y: 4.25,
      w: 2.4,
      h: 0.4,
      color: white,
      fontSize: 11,
      bold: true,
      fontFace: "Arial"
    });

    slide1.addText(kpi.desc, {
      x: 0.9 + (idx * 2.8),
      y: 4.75,
      w: 2.4,
      h: 0.6,
      color: "94A3B8",
      fontSize: 10,
      fontFace: "Arial"
    });
  });

  // Footer
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 6.8,
    w: "100%",
    h: 0.7,
    fill: { color: "0B1120" }
  });

  slide1.addText("Édité par FRED-TECH • Freddy Kalonda | Année Scolaire 2026-2027 | contact@fred-technique.cd", {
    x: 0.8,
    y: 6.95,
    w: 11.5,
    h: 0.4,
    color: "94A3B8",
    fontSize: 10,
    fontFace: "Arial"
  });

  // ==========================================
  // SLIDE 2 : SOMMAIRE & ARCHITECTURE GÉNÉRALE
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: lightBg };

  renderSlideHeader(slide2, pptx, "SOMMAIRE EXÉCUTIF", "Cartographie globale des capacités de SmartSchool RDC");

  // 2 columns grid for TOC
  const leftToc = FEATURE_SECTIONS.slice(0, 8);
  const rightToc = FEATURE_SECTIONS.slice(8, 16);

  const drawSlideToc = (items: FeatureSection[], startX: number) => {
    items.forEach((item, idx) => {
      const yPos = 1.6 + (idx * 0.58);
      slide2.addShape(pptx.ShapeType.roundRect, {
        x: startX,
        y: yPos,
        w: 5.6,
        h: 0.52,
        fill: { color: white },
        line: { color: "E2E8F0", width: 1 }
      });

      slide2.addShape(pptx.ShapeType.rect, {
        x: startX + 0.08,
        y: yPos + 0.08,
        w: 0.45,
        h: 0.36,
        fill: { color: primaryBlue }
      });

      slide2.addText(item.number, {
        x: startX + 0.08,
        y: yPos + 0.08,
        w: 0.45,
        h: 0.36,
        color: white,
        fontSize: 9,
        bold: true,
        align: "center",
        fontFace: "Arial"
      });

      slide2.addText(item.title, {
        x: startX + 0.65,
        y: yPos + 0.08,
        w: 4.8,
        h: 0.36,
        color: darkNavy,
        fontSize: 10,
        bold: true,
        fontFace: "Arial"
      });
    });
  };

  drawSlideToc(leftToc, 0.8);
  drawSlideToc(rightToc, 6.7);

  renderSlideFooter(slide2, pptx, 2);

  // ==========================================
  // SLIDES 3 À 18 : UNE SLIDE PAR MODULE DÉTAILLÉ
  // ==========================================
  FEATURE_SECTIONS.forEach((sec, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: lightBg };

    renderSlideHeader(slide, pptx, `${sec.number}. ${sec.title.toUpperCase()}`, sec.subtitle);

    // Left Column: Overview & Highlight Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 5.4,
      h: 4.9,
      fill: { color: white },
      line: { color: "E2E8F0", width: 1.5 }
    });

    // Category Pill
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.1,
      y: 1.7,
      w: 2.8,
      h: 0.35,
      fill: { color: "EEF2FF" },
      line: { color: "C7D2FE", width: 1 }
    });

    slide.addText(sec.category.toUpperCase(), {
      x: 1.1,
      y: 1.75,
      w: 2.8,
      h: 0.25,
      color: primaryBlue,
      fontSize: 8,
      bold: true,
      align: "center",
      fontFace: "Arial"
    });

    // Description
    slide.addText(sec.description, {
      x: 1.1,
      y: 2.2,
      w: 4.8,
      h: 1.1,
      color: "334155",
      fontSize: 11,
      fontFace: "Arial"
    });

    // Highlight Accent Callout
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.1,
      y: 3.4,
      w: 4.8,
      h: 1.3,
      fill: { color: "F8FAFC" },
      line: { color: accentGold, width: 2 }
    });

    slide.addText("VALEUR AJOUTÉE CLÉ :", {
      x: 1.25,
      y: 3.5,
      w: 4.5,
      h: 0.3,
      color: accentGold,
      fontSize: 9,
      bold: true,
      fontFace: "Arial"
    });

    slide.addText(sec.highlight, {
      x: 1.25,
      y: 3.8,
      w: 4.5,
      h: 0.8,
      color: darkNavy,
      fontSize: 10.5,
      bold: true,
      fontFace: "Arial"
    });

    // Badge Pill at bottom of left card
    slide.addText(`Badge Système : ${sec.badge}`, {
      x: 1.1,
      y: 5.8,
      w: 4.8,
      h: 0.4,
      color: slateGray,
      fontSize: 9.5,
      italic: true,
      fontFace: "Arial"
    });

    // Right Column: Key Features & Detail Points
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.5,
      y: 1.5,
      w: 5.8,
      h: 4.9,
      fill: { color: white },
      line: { color: "E2E8F0", width: 1.5 }
    });

    slide.addText("FONCTIONNALITÉS & COMPOSANTS CLÉS :", {
      x: 6.8,
      y: 1.7,
      w: 5.2,
      h: 0.35,
      color: primaryBlue,
      fontSize: 11,
      bold: true,
      fontFace: "Arial"
    });

    // Bullet points
    sec.keyPoints.forEach((point, pIdx) => {
      const pY = 2.15 + (pIdx * 0.72);
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 6.8,
        y: pY + 0.05,
        w: 0.12,
        h: 0.12,
        fill: { color: emeraldGreen }
      });

      slide.addText(point, {
        x: 7.05,
        y: pY,
        w: 4.95,
        h: 0.65,
        color: "1E293B",
        fontSize: 10,
        fontFace: "Arial"
      });
    });

    renderSlideFooter(slide, pptx, idx + 3);
  });

  // ==========================================
  // SLIDE FINALE : COMMERCIAL & DÉPLOIEMENT
  // ==========================================
  const finalSlide = pptx.addSlide();
  finalSlide.background = { color: darkNavy };

  finalSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.6,
    fill: { color: primaryBlue }
  });

  finalSlide.addText("DÉPLOIEMENT, TARIFICATION & CONTACT COMMERCIAL", {
    x: 0,
    y: 0.12,
    w: "100%",
    h: 0.35,
    align: "center",
    color: white,
    fontSize: 12,
    bold: true,
    fontFace: "Arial"
  });

  finalSlide.addText("Rejoignez le réseau des écoles modernes de la RDC", {
    x: 0.8,
    y: 1.2,
    w: 11.5,
    h: 0.6,
    color: accentGold,
    fontSize: 24,
    bold: true,
    fontFace: "Arial"
  });

  // 3 Process Steps
  const steps = [
    { num: "01", title: "Audit & Démonstration", desc: "Analyse gratuite de vos effectifs et démonstration personnalisée." },
    { num: "02", title: "Configuration 48h", desc: "Importation des élèves, classes et formation complète du personnel." },
    { num: "03", title: "Mise en Ligne & Suivi", desc: "Déploiement opérationnel, support 24/7 et assistance locale." }
  ];

  steps.forEach((st, sIdx) => {
    finalSlide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8 + (sIdx * 3.8),
      y: 2.1,
      w: 3.5,
      h: 2.3,
      fill: { color: "1E293B" },
      line: { color: primaryBlue, width: 2 }
    });

    finalSlide.addText(st.num, {
      x: 1.0 + (sIdx * 3.8),
      y: 2.3,
      w: 0.8,
      h: 0.4,
      color: accentGold,
      fontSize: 20,
      bold: true,
      fontFace: "Arial"
    });

    finalSlide.addText(st.title, {
      x: 1.0 + (sIdx * 3.8),
      y: 2.8,
      w: 3.1,
      h: 0.4,
      color: white,
      fontSize: 13,
      bold: true,
      fontFace: "Arial"
    });

    finalSlide.addText(st.desc, {
      x: 1.0 + (sIdx * 3.8),
      y: 3.3,
      w: 3.1,
      h: 0.9,
      color: "94A3B8",
      fontSize: 10.5,
      fontFace: "Arial"
    });
  });

  // Contact Box
  finalSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 4.8,
    w: 11.2,
    h: 1.6,
    fill: { color: primaryBlue }
  });

  finalSlide.addText("FRED-TECH — Freddy Kalonda", {
    x: 1.2,
    y: 5.0,
    w: 10.4,
    h: 0.4,
    color: white,
    fontSize: 16,
    bold: true,
    fontFace: "Arial"
  });

  finalSlide.addText("Email : contact@fred-technique.cd   |   Hotline & WhatsApp : +243 820 000 000   |   Kinshasa, RDC", {
    x: 1.2,
    y: 5.5,
    w: 10.4,
    h: 0.4,
    color: "E2E8F0",
    fontSize: 12,
    fontFace: "Arial"
  });

  finalSlide.addText("SmartSchool RDC • Le système intelligent de gestion scolaire nouvelle génération.", {
    x: 1.2,
    y: 5.9,
    w: 10.4,
    h: 0.3,
    color: accentGold,
    fontSize: 11,
    italic: true,
    fontFace: "Arial"
  });

  // Save the PPTX
  await pptx.writeFile({ fileName: "SmartSchool_RDC_Presentation_Officielle.pptx" });
}

// ==========================================
// HELPERS POUR RENDU PDF
// ==========================================

function renderHeader(doc: jsPDF, subtitle: string, title: string, pageNum: number) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 16, "F");

  doc.setFillColor(217, 119, 6);
  doc.rect(0, 16, pageWidth, 1, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(title, 15, 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(220, 230, 255);
  doc.text(subtitle, pageWidth - 15, 10.5, { align: "right" });
}

function renderFooter(doc: jsPDF, pageNum: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(226, 232, 240);
  doc.rect(15, pageHeight - 12, pageWidth - 30, 0.4, "F");

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("SmartSchool RDC • FRED-TECH par Freddy Kalonda — Document Commercial Officiel", 15, pageHeight - 7);
  doc.text(`Page ${pageNum}`, pageWidth - 15, pageHeight - 7, { align: "right" });
}

function renderSectionBlock(doc: jsPDF, sec: FeatureSection, startY: number) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Outer container
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, startY, pageWidth - 30, 118, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, startY, pageWidth - 30, 118, 3, 3, "S");

  // Number badge
  doc.setFillColor(30, 64, 175);
  doc.roundedRect(20, startY + 6, 12, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(sec.number, 26, startY + 14, { align: "center" });

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(sec.title, 36, startY + 11);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const splitSub = doc.splitTextToSize(sec.subtitle, pageWidth - 65);
  doc.text(splitSub[0] || sec.subtitle, 36, startY + 16);

  // Category Tag
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(pageWidth - 75, startY + 6, 55, 6, 1.5, 1.5, "F");
  doc.setTextColor(30, 64, 175);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text(sec.badge.toUpperCase(), pageWidth - 47.5, startY + 10.2, { align: "center" });

  // Description
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const splitDesc = doc.splitTextToSize(sec.description, pageWidth - 42);
  doc.text(splitDesc, 20, startY + 25);

  // Key Points (bulleted)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text("CAPACITÉS OPÉRATIONNELLES :", 20, startY + 41);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  let pointY = startY + 47;
  sec.keyPoints.slice(0, 4).forEach((pt) => {
    doc.setFillColor(5, 150, 105);
    doc.circle(23, pointY - 1.2, 1, "F");
    const splitPoint = doc.splitTextToSize(pt, pageWidth - 52);
    doc.text(splitPoint, 27, pointY);
    pointY += splitPoint.length > 1 ? 9.5 : 6.2;
  });

  // Highlight Box at bottom
  const hlY = startY + 92;
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(20, hlY, pageWidth - 40, 20, 2, 2, "F");
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.roundedRect(20, hlY, pageWidth - 40, 20, 2, 2, "S");

  doc.setTextColor(217, 119, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("POINT FORT POUR L'ÉTABLISSEMENT :", 24, hlY + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const splitHl = doc.splitTextToSize(sec.highlight, pageWidth - 50);
  doc.text(splitHl, 24, hlY + 12);
}

// ==========================================
// HELPERS POUR RENDU PPTX
// ==========================================

function renderSlideHeader(slide: any, pptx: any, title: string, subtitle: string) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.9,
    fill: { color: "1E40AF" }
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0.9,
    w: "100%",
    h: 0.06,
    fill: { color: "D97706" }
  });

  slide.addText(title, {
    x: 0.8,
    y: 0.15,
    w: 11.5,
    h: 0.4,
    color: "FFFFFF",
    fontSize: 16,
    bold: true,
    fontFace: "Arial"
  });

  slide.addText(subtitle, {
    x: 0.8,
    y: 0.52,
    w: 11.5,
    h: 0.3,
    color: "CBD5E1",
    fontSize: 10,
    fontFace: "Arial"
  });
}

function renderSlideFooter(slide: any, pptx: any, slideNum: number) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 6.9,
    w: "100%",
    h: 0.6,
    fill: { color: "0F172A" }
  });

  slide.addText("SmartSchool RDC • FRED-TECH par Freddy Kalonda — Document Commercial Officiel", {
    x: 0.8,
    y: 7.05,
    w: 9.0,
    h: 0.3,
    color: "94A3B8",
    fontSize: 9,
    fontFace: "Arial"
  });

  slide.addText(`Slide ${slideNum}`, {
    x: 10.5,
    y: 7.05,
    w: 1.5,
    h: 0.3,
    color: "D97706",
    fontSize: 9,
    bold: true,
    align: "right",
    fontFace: "Arial"
  });
}
