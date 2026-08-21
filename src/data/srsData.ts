export interface SRSSection {
  id: string;
  title: string;
  category: string;
  content: string;
  highlights?: string[];
}

export const srsSections: SRSSection[] = [
  {
    id: "vision",
    title: "1. Vision du projet",
    category: "Général",
    content: "SmartSchool RDC est conçu pour être la plateforme SaaS de référence pour la gestion et la modernisation des établissements scolaires en République Démocratique du Congo (RDC). Porté par l'expertise de Fred-Technique SARL, ce projet vise à combler la fracture numérique au sein du système éducatif congolais en fournissant un écosystème logiciel unifié, hautement disponible et adapté aux réalités locales (faible bande passante, coupures d'électricité récurrentes, diversité des rôles administratifs).\n\nL'application n'est pas seulement un outil de gestion administrative, mais un véritable levier de transparence et de performance scolaire. Elle relie numériquement tous les acteurs clés de l'écosystème éducatif — des autorités de tutelle (Ministère de l'Éducation Nationale et Nouvelle Citoyenneté) aux parents d'élèves, souvent tenus à l'écart du suivi quotidien par manque d'outils de communication fluides.",
    highlights: ["SaaS souverain congolais", "Inclusion numérique", "Transparence administrative"]
  },
  {
    id: "objectifs",
    title: "2. Objectifs",
    category: "Général",
    content: "Les objectifs stratégiques et opérationnels de SmartSchool RDC sont structurés comme suit :\n\n• Centralisation des données : Éliminer l'utilisation excessive de registres papier susceptibles d'être détruits ou perdus.\n• Suivi en temps réel des performances : Offrir aux préfets et directeurs des tableaux de bord analytiques sur le taux de réussite, l'absentéisme et la ponctualité.\n• Amélioration de la communication Parent-École : Alerter instantanément les parents en cas d'absence, d'indiscipline ou de publication de notes.\n• Sécurisation des transactions financières : Réduire les fraudes de caisse en intégrant des flux de paiement mobile (M-Pesa, Orange Money, Airtel Money) et des rapprochements bancaires automatisés.\n• Conformité réglementaire : Générer des rapports officiels conformes aux canevas de l'inspection générale de l'éducation nationale en RDC.",
    highlights: ["Zéro papier", "Transparence financière", "Suivi parental accru"]
  },
  {
    id: "types-utilisateurs",
    title: "3. Types d'utilisateurs",
    category: "Gestion des Accès",
    content: "La plateforme prend en charge une hiérarchie stricte à 8 niveaux d'acteurs pour refléter fidèlement l'organisation d'un complexe scolaire congolais :\n\n1. Super Administrateur (Fred-Technique SARL & Admin Système)\n2. Directeur / Promoteur de l'école\n3. Préfet des études (Responsable pédagogique)\n4. Secrétariat (Saisie administrative, inscriptions)\n5. Comptable (Gestion financière et écolage)\n6. Enseignant (Saisie des notes, cahier de textes, présences)\n7. Parent (Suivi des paiements, des notes et des comportements)\n8. Élève (Consultation des cours, devoirs et résultats)",
    highlights: ["8 rôles distincts", "Rôles adaptés au système congolais", "Gestion granulaire des profils"]
  },
  {
    id: "description-roles",
    title: "4. Description complète de chaque rôle",
    category: "Gestion des Accès",
    content: "• Super Administrateur (Fred-Technique) : Gère l'infrastructure multitenant, crée les instances des écoles clientes, configure les plans d'abonnement SaaS, surveille la sécurité globale et réalise les opérations de maintenance système.\n\n• Directeur / Promoteur : Possède une visibilité globale sur la santé financière de l'établissement, les statistiques de réussite, et l'efficacité opérationnelle des enseignants sans pouvoir modifier directement les notes pédagogiques.\n\n• Préfet des études : Cerveau pédagogique de l'école. Il valide les grilles de délibération, affecte les enseignants aux classes, configure l'année scolaire, valide les rapports de l'inspection et supervise la discipline.\n\n• Secrétariat : Gère le cycle de vie des élèves de l'inscription à la sortie. Il gère les dossiers physiques numérisés, édite les cartes d'élèves, et gère l'archivage numérique.\n\n• Comptable : Responsable de la perception des frais scolaires, du minerval, des frais d'État (Examen d'État, TENAFEP/ENAFEP). Il émet les reçus numériques sécurisés par QR Code et gère les salaires du personnel.\n\n• Enseignant : Enregistre les points par période, gère le cahier de textes numérique de sa classe, signale les absences des élèves à son cours, et communique avec la direction pedagogique.\n\n• Parent : Accède à un portail simplifié (web/mobile) pour suivre la scolarité de ses enfants, consulter l'historique des notes, recevoir des convocations de discipline, et effectuer le paiement à distance des frais scolaires.\n\n• Élève : Consulte son horaire personnalisé, télécharge des supports de cours partagés par ses enseignants, soumet des devoirs en ligne et suit l'évolution de ses points.",
    highlights: ["Rôles à responsabilités claires", "Séparation des pouvoirs financiers et pédagogiques"]
  },
  {
    id: "description-modules",
    title: "5. Description détaillée de tous les modules",
    category: "Fonctionnalités",
    content: "SmartSchool RDC s'articule autour de 12 modules interconnectés :\n\n1. Module d'Inscription et Scolarité : Gestion des fiches d'inscription d'élèves (formulaire officiel RDC), archivage des pièces jointes, attribution automatique des numéros matricules.\n2. Module Pédagogique et Classes : Configuration des cycles (Maternelle, Primaire, Humanités), des options (Pédagogie Générale, Commerciale et Gestion, Scientifique, Électricité, etc.) et des classes.\n3. Module d'Évaluation et Notes : Saisie des notes d'interrogations, de travaux pratiques et d'examens par période scolaire (1ère, 2ème, 3ème, 4ème période).\n4. Module de Délibération et Bulletins : Calcul automatique des pourcentages, gestion de la pondération, détection automatique des échecs selon la charte du Ministère.\n5. Module Caisse et Facturation : Suivi des versements, gestion des tranches d'écolage, relances de paiement, rapports de caisse journaliers.\n6. Module Ressources Humaines : Dossiers des enseignants, fiches de paie, gestion de la présence du personnel.\n7. Module de Messagerie et Notifications : Envoi de SMS et de notifications push aux parents en temps réel.\n8. Module d'Assistance IA (Fred-AI) : Aide à la rédaction de rapports d'inspection, détection précoce du décrochage scolaire, et génération automatique de questions d'exercices.\n9. Module Hors Ligne (Offline Sync) : Base de données locale synchronisée automatiquement dès qu'une connexion Internet stable est détectée.\n10. Module Discipline et Absences : Journalisation des sanctions, des retards et des absences non justifiées.\n11. Module Archives d'État : Archivage historique des registres de délibération sur 10 ans pour vérification ultérieure de l'authenticité des diplômes.\n12. Module Audit : Enregistrement de chaque action utilisateur avec signature cryptographique non modifiable.",
    highlights: ["12 modules intégrés", "Module délibération automatique", "Module caisse sécurisé"]
  },
  {
    id: "ecrans-app",
    title: "6. Description détaillée de chaque écran",
    category: "UI/UX",
    content: "• Écran de Connexion (Login Center) : Interface hautement sécurisée avec authentification forte (MFA optionnel pour les admins). Options de réinitialisation de mot de passe par e-mail ou SMS.\n\n• Tableau de bord Général (Multi-Role Dashboard) : Affichage personnalisé selon le rôle. Les widgets affichent des graphiques interactifs (Recharts) représentant les finances, le taux de présence globale, ou l'avancement des matières scolaires.\n\n• Écran de Saisie des Notes (Grade Portal) : Tableau matriciel fluide de type tableur permettant aux enseignants de saisir rapidement les cotes d'une période avec validation à la volée des limites maximales de points.\n\n• Écran de Configuration de l'École (Settings Core) : Permet de définir les détails légaux de l'école (code national, province éducationnelle, logo de l'établissement, signature du préfet numérisée pour les bulletins).\n\n• Écran de Suivi Financier (Cash flow Board) : Vue détaillée des paiements reçus par classe, des élèves insolvables, des dépenses approuvées et des soldes en banque.\n\n• Portail Parent (Family Link) : Écran mobile-first affichant la fiche de l'enfant avec sa photo, son bulletin virtuel dynamique, et son historique d'indiscipline.\n\n• Écran Générateur de Bulletins (Report Card Studio) : Outil de visualisation avant impression des bulletins scolaires au format officiel de la RDC avec filigrane de sécurité.",
    highlights: ["Saisie matricielle fluide", "Portail mobile-first pour les parents", "Filigrane de sécurité"]
  },
  {
    id: "menus-navigation",
    title: "7. Menus de navigation",
    category: "UI/UX",
    content: "La navigation est structurée de manière adaptative selon le rôle de l'utilisateur :\n\n• Barre Latérale Principale (Sidebar) : \n  - Section Administration : Écoles, Années scolaires, Classes, Options, Gestion des Utilisateurs.\n  - Section Scolarité : Inscriptions, Dossiers élèves, Absences, Discipline.\n  - Section Académique : Matières, Horaires, Saisie de notes, Bulletins scolaires, Délibérations.\n  - Section Finances : Caisse, Écolage, Frais d'État, Salaires, Dépenses.\n  - Section Rapports : Statistiques de réussite, Fiches E01 (Rapport annuel), Palmarès scolaires.\n  - Section Communication : Messagerie interne, Envoi SMS en masse, Annonces publiques.\n  - Section Paramètres : Profil, Sécurité, Configuration Fred-AI, Sauvegardes.\n\n• En-tête Supérieur (Navbar) : Selecteur d'année scolaire active, centre de notifications en temps réel, profil utilisateur et commutateur d'école (pour les promoteurs gérant plusieurs établissements).",
    highlights: ["Navigation contextuelle", "Sélecteur d'année scolaire global", "Centre de notifications"]
  },
  {
    id: "parcours-utilisateur",
    title: "8. Parcours utilisateur (User Flow)",
    category: "UI/UX",
    content: "Voici les trois parcours critiques modélisés pour assurer une efficacité opérationnelle maximale :\n\n1. Parcours d'Inscription et d'Affectation :\n   Secrétariat reçoit le parent -> Remplit le formulaire d'inscription en ligne -> Télécharge le bulletin de l'école précédente -> Le système valide l'âge et attribue un matricule unique -> Le comptable génère la facture pour le premier acompte -> L'élève est automatiquement affecté à une classe selon son option.\n\n2. Parcours de Saisie et de Délibération des Notes :\n   L'enseignant se connecte -> Sélectionne sa classe et sa matière -> Saisit les points de la 1ère Période -> Le système vérifie que les notes ne dépassent pas la note maximale (ex: /10 ou /20) -> Le préfet valide la période -> En fin de semestre, le système calcule le pourcentage semestriel -> Génération automatique du palmarès pour délibération en conseil des professeurs.\n\n3. Parcours de Paiement et d'Accès aux Résultats :\n   Le parent reçoit un SMS d'alerte pour les frais de la 2ème tranche -> Effectue le paiement via Mobile Money -> Le comptable valide la transaction -> Le système débloque automatiquement l'accès au bulletin en ligne de l'élève sur le portail parent.",
    highlights: ["Automatisation des alertes", "Validation des cotes à la source", "Déblocage dynamique du bulletin"]
  },
  {
    id: "database-schema",
    title: "9. Structure de la base de données",
    category: "Technique",
    content: "La base de données relationnelle (PostgreSQL via Cloud SQL) est conçue avec une intégrité référentielle stricte. Voici les entités principales et leurs liaisons :\n\n• schools (Id, Name, CodeNational, ProvinceEducationnelle, Logo, ContactEmail, CreatedAt)\n• school_years (Id, SchoolId, YearRange (ex: '2025-2026'), IsActive, CreatedAt)\n• options (Id, SchoolId, Name (ex: 'Commerciale et Gestion'), Code, CreatedAt)\n• classes (Id, SchoolYearId, OptionId, Level (ex: 1ère, 2ème, 3ème), RoomLetter (ex: 'A', 'B'), ClassTeacherId, MaxStudents)\n• users (Id, SchoolId, FirstName, LastName, Email, Phone, PasswordHash, Role (ENUM), Status (Active/Inactive))\n• students (Id, RegistrationNumber, FirstName, LastName, BirthDate, Gender, Address, ParentId, PhotoUrl, Status)\n• enrollments (Id, StudentId, ClassId, SchoolYearId, EnrollmentDate)\n• subjects (Id, SchoolId, Name (ex: 'Mathématiques'), Category (ENUM: Culture Générale, Scientifique, Professionnelle), MaxPointsInterro, MaxPointsExamen)\n• subject_assignments (Id, ClassId, SubjectId, TeacherId, HoursPerWeek)\n• grades (Id, EnrollmentId, SubjectId, Period (1, 2, Examen1, 3, 4, Examen2), ScoreObtained, RecordedBy, CreatedAt, UpdatedAt)\n• attendances (Id, EnrollmentId, Date, Status (Present, Absent, Late), Justified (Boolean), Reason, RecordedBy)\n• payments (Id, StudentId, SchoolYearId, Amount, PaymentType (ENUM: Ecolage, Minerval, Frais d'Etat), PaymentMethod, TransactionReference, IsValidated, CreatedAt)\n• audit_logs (Id, UserId, Action, TableName, RecordId, IPAddress, UserAgent, Timestamp)",
    highlights: ["Modèle hautement relationnel", "Archivage par année scolaire", "Historique de scolarité complet"]
  },
  {
    id: "permissions",
    title: "10. Permissions de chaque utilisateur",
    category: "Gestion des Accès",
    content: "SmartSchool RDC utilise un modèle RBAC (Role-Based Access Control) extrêmement rigide :\n\n• Super Administrateur : TOUS les droits globaux (Lecture, Écriture, Modification, Suppression) sur toutes les instances d'écoles.\n• Promoteur / Directeur : Lecture seule sur l'académique, modification autorisée sur les finances globales de l'établissement.\n• Préfet des études : Droits d'écriture/modification sur l'organisation des classes, matières, enseignants et validation finale des notes. Aucun droit de modification des transactions financières.\n• Secrétariat : Écriture et modification sur les dossiers d'élèves et inscriptions. Lecture seule sur les notes et finances.\n• Comptable : Droits complets d'écriture et modification sur le module de facturation et de caisse. Aucun accès en écriture sur les notes scolaires ou l'affectation pédagogique.\n• Enseignant : Écriture et modification uniquement sur les notes de sa matière dans ses classes affectées, et sur les présences de sa classe de cours. Lecture seule sur le reste.\n• Parent : Lecture seule sur les fiches de ses enfants, accès au paiement mobile sécurisé.\n• Élève : Lecture seule sur son propre espace (cours, devoirs, notes publiques).",
    highlights: ["RBAC (Role-Based Access Control)", "Audit log systématique", "Principe du moindre privilège"]
  },
  {
    id: "fonctionnement-bulletins",
    title: "11. Fonctionnement des bulletins selon le système de la RDC",
    category: "Scolaire",
    content: "Le calcul du bulletin dans le système éducatif congolais est rigoureusement codifié et modélisé dans SmartSchool RDC :\n\n• Structure de l'Année Scolaire : L'année est divisée en deux Semestres. Chaque semestre comprend deux Périodes et un Examen semestriel.\n  - Semestre 1 = 1ère Période (P1) + 2ème Période (P2) + Examen Semestriel 1 (EX1)\n  - Semestre 2 = 3ème Période (P3) + 4ème Période (P4) + Examen Semestriel 2 (EX2)\n\n• Calcul des Points :\n  - Le total d'une matière pour une Période est généralement noté sur un maximum défini (ex: 10 ou 20 points).\n  - L'examen semestriel est noté sur le double du maximum des périodes de ce semestre.\n  - Pourcentage Périodique : Somme des points obtenus par l'élève divisée par la somme des maxima de la période.\n  - Total Semestriel d'une matière = Points P1 + Points P2 + Points EX1. Le maximum semestriel est égal au maximum de P1 + maximum de P2 + maximum d'EX1 (ex: 10 + 10 + 20 = 40 points).\n  - Le total annuel d'une matière est la somme des points des deux semestres (Semestre 1 + Semestre 2).\n\n• Application des Règles de Délibération :\n  - Le système calcule automatiquement le pourcentage global annuel de l'élève.\n  - Mention de passage : Supérieur ou égal à 50%.\n  - Échecs majeurs : Si l'élève n'obtient pas la moyenne dans des matières de base spécifiques (comme le Français ou les Mathématiques), le système le signale pour la session de repêchage (seconde session) ou pour le redoublement automatique conformément aux directives ministérielles.",
    highlights: ["Semestrialisation officielle RDC", "Doublement du max à l'examen", "Détection automatique des repêchages"]
  },
  {
    id: "gestion-notes",
    title: "12. Gestion des notes",
    category: "Scolaire",
    content: "• Saisie Sécurisée : Les enseignants saisissent les points via une interface hautement réactive avec contrôle de saisie en temps réel pour bloquer les valeurs erronées (notes négatives ou supérieures au maximum).\n\n• Historique des Modifications : Toute modification d'une note déjà enregistrée nécessite un motif explicite et fait l'objet d'un log d'audit non modifiable.\n\n• Verrouillage Temporel : Les périodes de saisie sont délimitées dans le temps. Une fois la date limite dépassée par le préfet des études, l'enseignant ne peut plus modifier ses cotes sans autorisation écrite et déblocage manuel par la direction.\n\n• Coefficients et Pondérations : Configuration dynamique des maxima de points par matière selon le niveau de classe et l'option (par exemple, le cours de Physique a un maximum plus élevé en option Scientifique qu'en Pédagogie Générale).",
    highlights: ["Saisie contrôlée", "Verrouillage automatique des périodes", "Ajustement automatique des coefficients"]
  },
  {
    id: "gestion-absences",
    title: "13. Gestion des absences",
    category: "Scolaire",
    content: "• Appel Quotidien Numérique : L'enseignant réalise l'appel au début de chaque heure de cours ou de manière journalière (pour le primaire) depuis son application mobile ou son ordinateur.\n\n• Notification Parentale Automatisée : Dès qu'un élève est marqué absent non justifié, le système envoie une notification instantanée ou un SMS au numéro du parent d'élève configuré dans la base de données.\n\n• Gestion des Justifications : Le secrétariat ou le directeur de discipline reçoit le justificatif physique (certificat médical, lettre d'excuse), met à jour le statut de l'absence dans l'application avec téléversement de la pièce jointe.\n\n• Statistiques de Présence : Un rapport mensuel est généré pour chaque classe avec le taux d'absentéisme individuel et collectif, élément essentiel pour les délibérations de fin d'année.",
    highlights: ["Alerte SMS immédiate", "Suivi des justificatifs", "Statistiques d'assiduité globales"]
  },
  {
    id: "gestion-frais",
    title: "14. Gestion des frais scolaires",
    category: "Finance",
    content: "• Configuration des Tarifs : Définition des frais de scolarité (écolage) par classe ou option, des frais d'inscription, du minerval d'État et des frais d'évaluation.\n\n• Gestion des Échéances : Définition des dates limites pour chaque tranche de paiement (ex : 1ère tranche à l'inscription, 2ème en décembre, 3ème en mars).\n\n• Encaissement Multi-Canal : Prise en charge des paiements en espèces au guichet de l'école (avec édition automatique de reçu) et des paiements par Mobile Money (Orange Money, Airtel Money, M-Pesa) avec rapprochement en temps réel.\n\n• Suivi des Impayés et Blocage : Le système identifie automatiquement les élèves insolvables à l'approche de la date limite, permettant d'envoyer des relances automatiques par SMS aux parents et de bloquer l'accès aux bulletins numériques.",
    highlights: ["Mobile Money natif", "Suivi des tranches de paiement", "Relances automatiques"]
  },
  {
    id: "gestion-annees",
    title: "15. Gestion des années scolaires",
    category: "Scolaire",
    content: "• Création de Nouvelle Année : Permet de cloner la structure de l'école (classes, matières, options) d'une année à l'autre pour accélérer la configuration initiale.\n\n• Passage de Classe Automatique : À la fin de l'année scolaire active, après délibération finale, le système permet de transférer automatiquement les élèves promus vers le niveau supérieur pour la nouvelle année scolaire.\n\n• Archivage des Données : Verrouillage en écriture complet des années précédentes pour empêcher toute modification frauduleuse de l'historique scolaire de l'établissement.\n\n• Changement d'Année Actif : Possibilité pour les administrateurs de basculer temporairement sur l'affichage d'une ancienne année pour consulter des palmarès ou des bulletins archivés.",
    highlights: ["Clonage de configuration", "Transition automatique d'élèves", "Verrouillage anti-fraude"]
  },
  {
    id: "gestion-classes",
    title: "16. Gestion des classes",
    category: "Scolaire",
    content: "• Création de Classes Physiques : Association d'un niveau (ex: 3ème année des humanités), d'une option et d'une lettre de local (ex: 3ème Commerciale A).\n\n• Titulaire de Classe (Class Teacher) : Affectation d'un enseignant titulaire par classe. Le titulaire dispose de droits étendus pour saisir les appréciations globales sur le bulletin de ses élèves.\n\n• Gestion des Effectifs : Contrôle des capacités de chaque classe pour éviter la surcharge des locaux, avec un indicateur visuel (Vert/Orange/Rouge) selon le nombre d'élèves inscrits.\n\n• Emploi du Temps Dynamique : Générateur d'horaires hebdomadaires interactif permettant de visualiser les conflits de salles ou d'enseignants lors de l'attribution des heures de cours.",
    highlights: ["Titulaire de classe", "Contrôle de surcharge", "Détecteur de conflits d'horaire"]
  },
  {
    id: "gestion-options",
    title: "17. Gestion des options",
    category: "Scolaire",
    content: "En RDC, les humanités comportent une variété d'options techniques et générales :\n\n• Enregistrement des Options : Configuration des filières nationales telles que Scientifique (Biochimie, Math-Physique), Commerciale et Gestion, Pédagogie Générale, Sociale, Technique Industrielle (Électricité, Mécanique automobile), etc.\n\n• Liaison avec les Matières : Chaque option dicte une grille horaire et des maxima spécifiques (ex : le cours de Comptabilité est une matière à fort coefficient en option Commerciale, mais n'existe pas en option Scientifique).\n\n• Statistiques de Réussite par Option : Analyse comparative des taux de réussite à l'Examen d'État ou en interne par option pour évaluer la performance académique globale de l'établissement.",
    highlights: ["Options officielles RDC", "Pondération par filière", "Analyses comparatives"]
  },
  {
    id: "gestion-matieres",
    title: "18. Gestion des matières",
    category: "Scolaire",
    content: "• Catalogue National des Matières : Pré-configuration des cours selon le programme national officiel du Ministère de l'Éducation en RDC (Mathématiques, Français, Civisme et Éducation à la Citoyenneté, Histoire, Géographie, Physique, Chimie, Philosophie, etc.).\n\n• Catégorisation des Cours : Séparation des cours en disciplines fondamentales (cours de spécialité de l'option), de culture générale, et d'éducation physique.\n\n• Gestion des Pondérations : Configuration fine des points maximaux alloués aux interrogations régulières et aux examens semestriels pour chaque matière selon le niveau d'études.\n\n• Archivage des Programmes : Liaison des supports de cours et des fiches pédagogiques numériques aux matières concernées pour faciliter l'accès par les élèves.",
    highlights: ["Conforme au programme RDC", "Pondération adaptative", "Bibliothèque de cours intégrée"]
  },
  {
    id: "gestion-enseignants",
    title: "19. Gestion des enseignants",
    category: "Ressources Humaines",
    content: "• Profil Professionnel Complet : Enregistrement des informations personnelles, diplômes d'études, ancienneté, matricule de l'État (pour les écoles publiques ou conventionnées).\n\n• Affectation Académique : Grille visuelle d'attribution des matières et des classes pour chaque enseignant avec calcul de la charge horaire hebdomadaire pour s'assurer du respect des normes de travail.\n\n• Suivi des Performances : Historique d'assiduité aux cours (présence au journal de classe), appréciations de la direction pédagogique et évaluation des résultats de ses élèves aux examens.\n\n• Gestion de la Paie : Calcul automatique des primes, avances sur salaire et salaires de base avec génération de fiches de paie imprimables.",
    highlights: ["Charge horaire automatisée", "Suivi d'assiduité", "Fiche de paie intégrée"]
  },
  {
    id: "gestion-eleves",
    title: "20. Gestion des élèves",
    category: "Scolaire",
    content: "• Dossier Scolaire Unique : Chaque élève possède une fiche numérique centralisée contenant ses données d'état civil, sa photo d'identité, son historique de notes sur plusieurs années, ses certificats médicaux et ses sanctions disciplinaires.\n\n• Génération de Matricule : Attribution automatique d'un numéro matricule standardisé à l'inscription, servant d'identifiant unique durant tout son parcours au sein de l'établissement.\n\n• Carte d'Élève Intelligente : Génération et exportation au format PDF de cartes d'élèves prêtes à l'impression, comprenant un QR Code unique pour le contrôle des présences et la vérification des paiements.\n\n• Suivi de Santé et d'Inclusion : Enregistrement des allergies, maladies chroniques ou besoins d'accompagnement particuliers pour alerter la direction et les enseignants concernés.",
    highlights: ["Matricule unique", "Exportation de carte QR Code", "Suivi médical et disciplinaire"]
  },
  {
    id: "gestion-parents",
    title: "21. Gestion des parents",
    category: "Scolaire",
    content: "• Liaison Multi-Enfants : Un parent ou tuteur légal possède un compte unique lié à tous ses enfants inscrits dans l'établissement, facilitant un suivi global sans reconnexion.\n\n• Profil de Contact Sécurisé : Enregistrement des coordonnées de contact prioritaires (téléphone pour alertes SMS, adresse physique, adresse e-mail) et du lien de parenté.\n\n• Espace de Communication : Historique des SMS envoyés par l'école, fil de discussion direct avec la direction ou le titulaire de classe de l'enfant.\n\n• Suivi Financier Centralisé : Historique détaillé des paiements effectués pour chaque enfant et tableau de bord des frais restant à solder avec rappels automatiques.",
    highlights: ["Compte tuteur multi-enfants", "Canal de communication dédié", "Suivi budgétaire familial"]
  },
  {
    id: "tableau-de-bord",
    title: "22. Tableau de bord",
    category: "UI/UX",
    content: "L'application affiche des tableaux de bord dynamiques et hautement interactifs, personnalisés en temps réel selon le profil connecté :\n\n• Tableau de bord Préfet : Indicateurs clés (KPIs) sur le taux d'inscription global, taux de présence des élèves et enseignants aujourd'hui, moyenne générale de l'établissement par rapport à l'année précédente, alertes sur les classes en retard sur le programme.\n\n• Tableau de bord Comptable : Graphique d'évolution des recettes d'écolage par rapport aux prévisions budgétaires, montants perçus au guichet vs Mobile Money, liste des relances financières à effectuer.\n\n• Tableau de bord Enseignant : Liste des classes de la journée, raccourcis de saisie rapide de notes pour la période active, alertes sur les cahiers de textes à compléter.\n\n• Tableau de bord Parent : Résumé visuel de la journée de l'enfant (présence, notes publiées ce matin, avertissements de discipline éventuels), bouton de paiement direct de la prochaine tranche de frais.",
    highlights: ["Indicateurs clés de performance", "Graphiques interactifs", "Widgets contextuels par rôle"]
  },
  {
    id: "statistiques",
    title: "23. Statistiques",
    category: "Analytique",
    content: "SmartSchool RDC intègre un moteur d'analyse statistique avancé (utilisant D3.js et Recharts) :\n\n• Statistiques Académiques : Répartition des élèves par mention (Excellence, Distiction, Satisfaction, Passage, Échec), courbe d'évolution des performances moyennes par classe et par option tout au long de l'année scolaire.\n\n• Statistiques Démographiques : Pyramide des âges des élèves, répartition des effectifs par genre (pour encourager et suivre l'éducation des filles en RDC - indicateur d'inclusion éducative), répartition géographique des élèves.\n\n• Statistiques d'Assiduité : Taux de présence par classe, par jour de la semaine et par enseignant pour détecter les jours à forte absence.",
    highlights: ["Moteur d'analyse Recharts", "Indicateurs d'inclusion de genre", "Suivi d'assiduité analytique"]
  },
  {
    id: "rapports",
    title: "24. Rapports",
    category: "Analytique",
    content: "• Palmarès Scolaire : Génération automatique du palmarès de fin d'année avec le classement général de tous les élèves d'une classe, de l'option ou de l'établissement pour la délibération finale.\n\n• Fiches Officielles MINEPST (EPSST) : Génération et pré-remplissage des formulaires officiels requis par l'inspection générale de l'éducation (fiches de statistiques E01, rapports administratifs trimestriels).\n\n• Fiches de Cotes Individuelles : Rapports condensés de toutes les notes obtenues par un élève durant un semestre dans chaque matière, signés électroniquement par l'enseignant et validés par le préfet.\n\n• Rapports Comptables : Journaux de caisse mensuels, relevés bancaires intégrés, état de recouvrement des frais scolaires par classe.",
    highlights: ["Palmarès de fin d'année", "Formulaires officiels EPSST pré-remplis", "Journaux de caisse conformes"]
  },
  {
    id: "notifications",
    title: "25. Notifications",
    category: "Communication",
    content: "• Centre de Notifications Intégré : Cloche de notifications interactive en haut de la navbar signalant les actions urgentes ou d'intérêt direct selon l'utilisateur.\n\n• Passerelle SMS Intégrée : Envoi de SMS directs via des fournisseurs télécom locaux pour les alertes critiques (absences, discipline, rappels financiers urgents) ne nécessitant pas de connexion Internet chez le parent.\n\n• Notifications Push de l'Application : Alertes instantanées sur l'interface utilisateur pour la messagerie interne, les annonces de devoirs et la publication des notes d'interrogations.\n\n• Rappels Automatisés de Calendrier : Notifications automatiques avant les réunions de parents d'élèves, les dates de examens et les conseils de professeurs.",
    highlights: ["Routage SMS local", "Notifications push instantanées", "Système d'alertes programmées"]
  },
  {
    id: "messagerie-interne",
    title: "26. Messagerie interne",
    category: "Communication",
    content: "• Canaux de Discussion Sécurisés : Permet aux enseignants, préfets et parents d'échanger au sein d'une interface de chat contrôlée, évitant l'utilisation d'applications tierces non professionnelles.\n\n• Messagerie Administrative : Canal direct pour l'envoi de notes de service internes de la direction vers le personnel enseignant avec accusé de lecture numérique.\n\n• Respect de la Vie Privée : Les élèves ne peuvent pas contacter directement les enseignants en dehors du cadre académique approuvé. Les parents ne peuvent écrire aux enseignants que pendant les heures ouvrables configurées dans le système.",
    highlights: ["Messagerie intégrée sécurisée", "Accusés de lecture", "Contrôle parental et horaires"]
  },
  {
    id: "sauvegarde-donnees",
    title: "27. Sauvegarde des données",
    category: "Technique",
    content: "• Sauvegarde Automatique Quotidienne : Les bases de données sont sauvegardées de manière incrémentielle toutes les nuits vers un stockage Cloud redondant géographiquement.\n\n• Versioning des Données : Historique complet des sauvegardes permettant de restaurer l'état de la base de données à n'importe quel point précis des 30 derniers jours (Point-in-Time Recovery).\n\n• Exportation Manuelle Sécurisée : Le préfet ou le super administrateur peut exporter à tout moment des archives compressées au format standard (JSON/CSV) contenant toutes les notes, paiements et effectifs de l'année scolaire.\n\n• Sécurité Physique et Chiffrement : Toutes les sauvegardes de SmartSchool RDC sont chiffrées au repos en AES-256 avec des clés gérées de manière hautement sécurisée.",
    highlights: ["Backup quotidien redondant", "Point-in-Time Recovery", "Export local chiffré"]
  },
  {
    id: "journal-activites",
    title: "28. Journal des activités (Audit)",
    category: "Sécurité",
    content: "• Traçabilité Totale : Chaque action critique (connexion, saisie de note, modification de paiement, suppression de dossier) est consignée dans un journal d'audit crypté et inviolable.\n\n• Métadonnées d'Audit : Chaque entrée de log enregistre l'ID de l'utilisateur, son rôle, l'action exacte, l'horodatage précis, l'adresse IP de l'appareil utilisé, ainsi que l'identifiant du navigateur (User-Agent).\n\n• Détection d'Anomalies de Connexion : Des algorithmes de sécurité analysent en continu les connexions pour signaler des comportements suspects (ex : connexions simultanées depuis des villes différentes ou modifications de notes à des heures inhabituelles).\n\n• Outil d'Enquête pour Préfet : Interface permettant au préfet de filtrer le journal d'audit par élève, enseignant ou classe pour tirer au clair toute contestation de note ou suspicion de fraude.",
    highlights: ["Audit log cryptographique", "Enregistrement IP et User-Agent", "Détection de comportements suspects"]
  },
  {
    id: "securite",
    title: "29. Sécurité",
    category: "Sécurité",
    content: "Fred-Technique SARL fait de la sécurité des données d'enfants et de finances sa priorité absolue :\n\n• Protocoles de Chiffrement : Toutes les transmissions de données transitent via des protocoles HTTPS avec TLS 1.3. Les données sensibles (mots de passe, fiches financières) sont cryptées à l'aide d'algorithmes de pointe (bcrypt pour les mots de passe).\n\n• Protection contre les Vulnérabilités (OWASP) : Systèmes de protection natifs contre l'injection SQL, le Cross-Site Scripting (XSS), le CSRF et les attaques par force brute (avec blocage temporaire automatique des comptes après 5 tentatives infructueuses).\n\n• Conformité RGPD et Législation Congolaise : Respect strict des règles de protection des données personnelles, avec droits de suppression de comptes à la fin de la scolarité et anonymisation des données statistiques obsolètes.",
    highlights: ["TLS 1.3 et bcrypt", "Protection OWASP renforcée", "Conformité légale des données"]
  },
  {
    id: "architecture-logique",
    title: "30. Architecture logique du logiciel",
    category: "Technique",
    content: "L'architecture globale de SmartSchool RDC suit les standards modernes de l'industrie SaaS :\n\n• Frontend (Client) : Application SPA développée en React (avec TypeScript), utilisant Tailwind CSS pour un rendu graphique léger, réactif et fluide. Intégration de Lucide-React pour les icônes de navigation.\n\n• Backend (Serveur) : API RESTful robuste développée avec Express (Node.js), structurée en couches (Contrôleurs, Services, Répertoires) et connectée via un ORM moderne (Drizzle/Prisma) pour garantir l'intégrité des requêtes.\n\n• Base de Données : Base relationnelle PostgreSQL hébergée sur Cloud SQL, configurée avec des index de performances sur les clés étrangères fréquentes (StudentId, SubjectId, ClassId).\n\n• Modèle Multi-Tenant : Séparation logique stricte des données d'écoles via une colonne clé étrangère globale 'SchoolId' dans chaque table, associée à des middlewares de vérification systématique dans les contrôleurs de l'API.",
    highlights: ["React + Node/Express (TypeScript)", "PostgreSQL sur Cloud SQL", "Multi-Tenancy logique étanche"]
  },
  {
    id: "fonctionnalites-ia",
    title: "31. Fonctionnalités innovantes utilisant l'IA",
    category: "Innovation",
    content: "Fred-AI, l'intelligence artificielle intégrée à SmartSchool RDC (basée sur l'API Gemini de Google), révolutionne l'expérience utilisateur :\n\n• Détection Précoce du Décrochage Scolaire : Analyse continue des courbes de notes et d'absences pour alerter la direction pédagogique sur les élèves à risque de redoublement ou d'abandon avant la fin du trimestre.\n\n• Aide à la Rédaction de Rapports : Générateur d'appréciations personnalisées et professionnelles pour les bulletins d'élèves en se basant sur leurs performances globales et assiduité.\n\n• Assistant de Planification de Cours : Fred-AI aide les enseignants à structurer leurs fiches de préparation de leçons selon le référentiel du Ministère de l'Éducation Nationale de la RDC.\n\n• Analyse de Tendances Financières : Prédiction intelligente des flux de caisse et des retards de paiement d'écolage pour aider la direction à planifier l'approvisionnement en fournitures et les salaires des enseignants.",
    highlights: ["Gemini API intégrée en backend", "Prédiction du décrochage scolaire", "Générateur d'appréciations pédagogiques"]
  },
  {
    id: "fonctionnement-offline",
    title: "32. Fonctionnement hors connexion (Offline Sync)",
    category: "Technique",
    content: "Pour pallier les contraintes d'infrastructure courantes en RDC (coupures réseau), SmartSchool RDC embarque un moteur de synchronisation résilient :\n\n• Stockage Local (IndexedDB/LocalForage) : Les actions de base (saisie de note, prise de présence, enregistrement d'une sanction) sont enregistrées localement dans l'appareil si le réseau est indisponible.\n\n• File d'Attente de Synchronisation (Queue Manager) : Les requêtes d'écriture non soumises sont stockées chronologiquement avec un statut 'En attente de synchronisation'.\n\n• Synchronisation Automatique Arrière-plan : Dès que l'application détecte un retour de connexion stable (Service Worker et écouteurs réseau), la file d'attente est traitée de manière asynchrone avec résolution intelligente des conflits de données en faveur des horodatages les plus récents.",
    highlights: ["IndexedDB local résilient", "Gestionnaire de file d'attente (Queue)", "Résolution de conflits par horodatage"]
  },
  {
    id: "plan-developpement",
    title: "33. Plan de développement découpé en versions",
    category: "Général",
    content: "• Version V1 (MVP - Noyau Administratif et Scolaire) : \n  - Inscriptions des élèves et gestion des classes, options, matières et enseignants.\n  - Saisie des notes de base, calcul automatique des bulletins, impression PDF.\n  - Module caisse de base (enregistrement des paiements au guichet, édition des reçus).\n  - Journal d'audit de base.\n\n• Version V2 (Plateforme Connectée et Financière) :\n  - Portail Parent interactif et application mobile-first.\n  - Intégration des APIs de paiement Mobile Money local (M-Pesa, Orange, Airtel).\n  - Centre de notifications et passerelle SMS d'alertes automatisées.\n  - Mode hors connexion avec synchronisation des notes et présences.\n\n• Version V3 (Plateforme Intelligente et Analyse Majeure) :\n  - Modules d'IA 'Fred-AI' (détection du décrochage, générateur de fiches scolaires, prédictions financières).\n  - Module de Ressources Humaines complet (fiche de présence d'enseignants, gestion de la paie automatisée).\n  - Intégration de fiches officielles EPSST d'inspection pré-remplies.\n  - Sécurité avancée avec chiffrement matériel et journal d'audit cryptographique complet.",
    highlights: ["V1 : Coeur de gestion scolaire", "V2 : Portabilité et Mobile Money", "V3 : Intelligence artificielle Fred-AI"]
  }
];
