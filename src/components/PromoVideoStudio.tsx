import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, SkipForward, SkipBack, 
  Sparkles, CheckCircle2, ArrowRight, Monitor, Radio, Award, Building, Users, 
  GraduationCap, Briefcase, Landmark, CreditCard, ShieldCheck, MessageSquare, 
  FileText, Smartphone, Tv, Film, Download, Share2, Layers, Eye, Check, Star
} from "lucide-react";

interface PromoVideoStudioProps {
  onNavigateTab: (tabId: string) => void;
  userName?: string;
  userRole?: string;
}

interface CommercialScene {
  id: number;
  title: string;
  subtitle: string;
  durationSeconds: number;
  tabKey: string; // Tab ID in SmartSchool RDC
  narratorScript: string;
  tagline: string;
  featuresShown: string[];
  mockDataSummary: {
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    badge: string;
  };
  visualTheme: string; // Tailwind gradient style for background preview
}

export function PromoVideoStudio({ onNavigateTab, userName = "Directeur", userRole = "Préfet des études" }: PromoVideoStudioProps) {
  // 15 Cinematic Master Scenes covering all user requirements (Duration: 6m 20s)
  const scenes: CommercialScene[] = [
    {
      id: 1,
      title: "1. Création & Configuration de l'Établissement Scolaire",
      subtitle: "Assistant d'Activation Étape par Étape (First-Use Wizard)",
      durationSeconds: 25,
      tabKey: "wizard",
      narratorScript: "Bienvenue dans SmartSchool RDC. Dès le premier jour, notre assistant intelligent guide le préfet dans la création complète de son établissement : nom officiel, province éducative, régime de gestion, sections d'enseignement et coordonnées officielles MINEPSP.",
      tagline: "Déploiement immédiat d'une école complète en 3 minutes.",
      featuresShown: [
        "Saisie des identifiants administratifs MINEPSP / EPST",
        "Configuration des options (Scientifique, Littéraire, Pédagogie, Technique)",
        "Paramétrage de l'année scolaire et des modalités de paiement"
      ],
      mockDataSummary: {
        stat1Label: "Temps Configuration",
        stat1Value: "3 Minutes",
        stat2Label: "Conformité EPST",
        stat2Value: "100% Validé",
        badge: "ASSISTANT CRÉATION ÉCOLE"
      },
      visualTheme: "from-blue-950 via-slate-900 to-indigo-950"
    },
    {
      id: 2,
      title: "2. Inscription d'un Élève & Numérisation du Dossier",
      subtitle: "Gestion de Scolarité & Identification Nationale",
      durationSeconds: 25,
      tabKey: "eleves",
      narratorScript: "Inscrivez vos élèves en toute simplicité. Renseignez l'état civil, les photos d'identité, les antécédents médicaux et les numéros de téléphone des tuteurs. Chaque dossier génère automatiquement un Matricule National Inviolable.",
      tagline: "Numérisation intégrale de la scolarité des apprenants.",
      featuresShown: [
        "Fiche d'inscription complète avec photo & contacts tuteurs",
        "Attribution d'un matricule unique et QR Code sécurisé",
        "Impression immédiate de la carte d'identité scolaire"
      ],
      mockDataSummary: {
        stat1Label: "Inscriptions Jour",
        stat1Value: "128 Élèves",
        stat2Label: "Dossiers Valides",
        stat2Value: "100%",
        badge: "MODULE SCOLARITÉ ÉLÈVES"
      },
      visualTheme: "from-indigo-950 via-slate-900 to-blue-950"
    },
    {
      id: 3,
      title: "3. Création Automatique des Comptes & Gestion des Accès",
      subtitle: "Sécurité IAM & Rôles Étanches (RBAC)",
      durationSeconds: 25,
      tabKey: "dashboard",
      narratorScript: "Lors de l'inscription d'un élève ou de l'embauche d'un enseignant, SmartSchool RDC génère instantanément les comptes d'accès personnalisés avec leurs identifiants temporaires transmis par SMS sécurisé.",
      tagline: "Des accès sécurisés attribués en temps réel sans effort.",
      featuresShown: [
        "Génération automatique des identifiants et mots de passe",
        "Gestion des rôles : Directeur, Enseignant, Parent, Élève, Comptable",
        "Chiffrement des clés et réinitialisation SMS"
      ],
      mockDataSummary: {
        stat1Label: "Comptes Générés",
        stat1Value: "1,280 Actifs",
        stat2Label: "Sécurité Accès",
        stat2Value: "RBAC Certifié",
        badge: "GESTION AUTOMATIQUE IAM"
      },
      visualTheme: "from-slate-950 via-indigo-950 to-slate-900"
    },
    {
      id: 4,
      title: "4. Portail Directeur & Préfet des Études",
      subtitle: "Supervision Stratégique & Pilotage 360°",
      durationSeconds: 25,
      tabKey: "dashboard",
      narratorScript: "Le Portail Directeur offre une vision globale et en temps réel de votre établissement : suivi des effectifs par section, taux de présence quotidienne, état d'avancement des programmes et santé financière.",
      tagline: "Prenez les meilleures décisions grâce aux données en direct.",
      featuresShown: [
        "Tableau de bord stratégique avec indicateurs clés (KPI)",
        "Alertes instantanées de retards, absences et impayés",
        "Approbations rapides des dépenses et demandes RH"
      ],
      mockDataSummary: {
        stat1Label: "Présence Globale",
        stat1Value: "96.4%",
        stat2Label: "Effectif Total",
        stat2Value: "1,280 Élèves",
        badge: "SUPERVISION DIRECTORIALE"
      },
      visualTheme: "from-blue-950 via-slate-900 to-slate-950"
    },
    {
      id: 5,
      title: "5. Portail Enseignant & Encadrement Pédagogique",
      subtitle: "Gestion des Cours, Absences & Cahier de Texte",
      durationSeconds: 25,
      tabKey: "enseignants",
      narratorScript: "Sur son espace dédié, l'enseignant consulte son horaire de cours, fait l'appel numérique de sa classe, remplit le cahier de texte quotidien et soumet les devoirs aux élèves en quelques clics.",
      tagline: "Libérez vos enseignants des tâches administratives lourdes.",
      featuresShown: [
        "Prise de présence instantanée par coche tactile",
        "Saisie du cahier de texte et objectifs de leçon",
        "Distribution des devoirs et exercices pratiques"
      ],
      mockDataSummary: {
        stat1Label: "Enseignants Connectés",
        stat1Value: "64 Profs",
        stat2Label: "Cahiers Remplis",
        stat2Value: "98.5%",
        badge: "ESPACE PEDAGOGIQUE PROF"
      },
      visualTheme: "from-emerald-950 via-slate-900 to-teal-950"
    },
    {
      id: 6,
      title: "6. Portail Parent & Suivi Familial",
      subtitle: "Transparence Totale sur la Scolarité de l'Enfant",
      durationSeconds: 25,
      tabKey: "dashboard",
      narratorScript: "Depuis leur smartphone ou ordinateur, les parents suivent la présence quotidienne de leurs enfants, leurs résultats scolaires, les devoirs à faire et règlent les frais scolaires en toute sécurité.",
      tagline: "Impliquez les familles dans la réussite de leurs enfants.",
      featuresShown: [
        "Consultation en temps réel des notes et bulletins trimestriels",
        "Notifications immédiates en cas d'absence ou retard",
        "Paiement direct des frais depuis l'application"
      ],
      mockDataSummary: {
        stat1Label: "Engagement Parents",
        stat1Value: "97.2%",
        stat2Label: "SMS Alertes",
        stat2Value: "Instantanés",
        badge: "PORTAIL PARENTS MOBILES"
      },
      visualTheme: "from-purple-950 via-slate-900 to-blue-950"
    },
    {
      id: 7,
      title: "7. Portail Élève & Révisions Numériques",
      subtitle: "Emploi du Temps, Devoirs & Ressources Pédagogiques",
      durationSeconds: 25,
      tabKey: "homework",
      narratorScript: "L'espace élève responsabilise l'apprenant : consultation du calendrier des contrôles, téléchargement des devoirs, vérification des notes obtenues et accès aux cours numérisés.",
      tagline: "Un environnement d'apprentissage stimulant et moderne.",
      featuresShown: [
        "Emploi du temps interactif hebdomadaire",
        "Remise des devoirs en ligne et consultation des corrections",
        "Suivi individuel des moyennes par discipline"
      ],
      mockDataSummary: {
        stat1Label: "Devoirs Soumis",
        stat1Value: "94.0%",
        stat2Label: "Accès Écritures",
        stat2Value: "24/7",
        badge: "PORTAIL ÉLÈVE APPRENANT"
      },
      visualTheme: "from-indigo-950 via-slate-900 to-purple-950"
    },
    {
      id: 8,
      title: "8. Enregistrement d'un Paiement Mobile Money & Caisse",
      subtitle: "M-Pesa, Orange Money, Airtel Money & Banque",
      durationSeconds: 25,
      tabKey: "comptabilite",
      narratorScript: "Simplifiez le recouvrement des minervals ! Les parents paient via M-Pesa, Orange Money, Airtel Money ou au guichet de l'école. La transaction est validée en direct avec mise à jour immédiate du compte élève.",
      tagline: "Fini les queues à la caisse et la gestion manuelle du cash.",
      featuresShown: [
        "Validation automatique des paiements M-Pesa, Orange, Airtel Money",
        "Gestion multi-tranches des frais de scolarité",
        "Avis de retard automatiques envoyés aux tuteurs"
      ],
      mockDataSummary: {
        stat1Label: "Mobile Money",
        stat1Value: "88.5%",
        stat2Label: "Recouvrement",
        stat2Value: "92.0%",
        badge: "RECOUVREMENT MOBILE MONEY"
      },
      visualTheme: "from-amber-950 via-slate-900 to-emerald-950"
    },
    {
      id: 9,
      title: "9. Génération Automatique du Reçu de Caisse",
      subtitle: "Preuve de Paiement Officielle avec QR Code d'Authenticité",
      durationSeconds: 25,
      tabKey: "comptabilite",
      narratorScript: "Chaque paiement déclenche l'impression instantanée d'un reçu de caisse certifié, doté d'un numéro d'enregistrement comptable unique et envoyé directement par SMS au tuteur.",
      tagline: "Zéro risque de contestation ou de double saisie.",
      featuresShown: [
        "Génération de reçu certifié avec numéro de transaction unique",
        "Signature numérique de l'économe et timbre de l'école",
        "Historique immuable consultable par les auditeurs"
      ],
      mockDataSummary: {
        stat1Label: "Reçus Générés",
        stat1Value: "100% Validés",
        stat2Label: "Transparence",
        stat2Value: "Totale",
        badge: "REÇU D'ENREGISTREMENT CAISSE"
      },
      visualTheme: "from-emerald-950 via-slate-900 to-blue-950"
    },
    {
      id: 10,
      title: "10. Encodage Fluidifié des Notes & Évaluations",
      subtitle: "Saisie des Cotes Trimestrielles par les Enseignants",
      durationSeconds: 25,
      tabKey: "eleves",
      narratorScript: "L'encodage des points devient un plaisir. Les enseignants saisissent les cotes d'interrogations, devoirs et examens sur une grille ergonomique qui calcule automatiquement les totaux et pourcentages.",
      tagline: "Finis les calculs manuels fastidieux et les erreurs de report.",
      featuresShown: [
        "Grille de saisie rapide sécurisée avec validation des plafonds",
        "Calcul en direct des moyennes pondérées par coefficient",
        "Verrouillage des notes après validation par la direction"
      ],
      mockDataSummary: {
        stat1Label: "Saisie Cotes",
        stat1Value: "2 Clics",
        stat2Label: "Erreurs Report",
        stat2Value: "0.0%",
        badge: "ENCODAGE DES NOTES"
      },
      visualTheme: "from-blue-950 via-indigo-950 to-slate-900"
    },
    {
      id: 11,
      title: "11. Génération du Bulletin Officiel MINEPSP / EPST",
      subtitle: "Modèle Réglementaire National Conforme RDC",
      durationSeconds: 30,
      tabKey: "eleves",
      narratorScript: "En un clic, générez les bulletins trimestriels et annuels strictement conformes aux normes du Ministère de l'Éducation Nationale RDC. Avec moyennes, pourcentages, rangs, mentions et conduite.",
      tagline: "Impression haute définition prête pour la remise des bulletins.",
      featuresShown: [
        "Modèle officiel MINEPSP / EPST avec armoiries nationales",
        "Calcul automatisé des rangs, pourcentages et décisions du conseil",
        "Espace pour signature du Préfet et sceau de l'établissement"
      ],
      mockDataSummary: {
        stat1Label: "Bulletins Imprimés",
        stat1Value: "1,280/Trimestre",
        stat2Label: "Conformité",
        stat2Value: "100% MINEPSP",
        badge: "BULLETIN OFFICIEL RDC"
      },
      visualTheme: "from-indigo-950 via-blue-950 to-slate-950"
    },
    {
      id: 12,
      title: "12. Statistiques Administratives, Financières & Taux de Réussite",
      subtitle: "Rapports d'Inspection & Analyses Graphiques D3",
      durationSeconds: 25,
      tabKey: "dashboard",
      narratorScript: "Visualisez la performance globale de votre école : graphiques d'évolution des recettes, taux de réussite par option, pyramide des âges, et rapports prêts pour les inspecteurs provinciaux.",
      tagline: "Une gouvernance moderne basée sur des chiffres certifiés.",
      featuresShown: [
        "Graphiques interactifs d'évolution des effectifs et finances",
        "Tableau récapitulatif MINEPSP pour la division provinciale",
        "Exportation Excel, PDF et rapports imprimables"
      ],
      mockDataSummary: {
        stat1Label: "Taux Réussite",
        stat1Value: "89.5%",
        stat2Label: "Rapports EPST",
        stat2Value: "Excellents",
        badge: "STATISTIQUES & RAPPORTS"
      },
      visualTheme: "from-slate-950 via-blue-950 to-emerald-950"
    },
    {
      id: 13,
      title: "13. Messagerie Instantanée & Alertes SMS Nationales",
      subtitle: "Canal Direct de Communication Établissement - Parents",
      durationSeconds: 25,
      tabKey: "messagerie",
      narratorScript: "Maintenez un dialogue permanent avec la communauté éducative : diffusion de communiqués officiels, alertes SMS d'urgence aux familles, et chat sécurisé entre enseignants et direction.",
      tagline: "Une communication fluide, rapide et traçable.",
      featuresShown: [
        "Envoi de SMS en masse aux parents par classe ou option",
        "Discussion interne sécurisée entre le personnel scolaire",
        "Journal des messages transmis et accusés de réception"
      ],
      mockDataSummary: {
        stat1Label: "SMS Transmis",
        stat1Value: "15,000 / mois",
        stat2Label: "Livrabilité",
        stat2Value: "99.8%",
        badge: "COMMUNICATION INTEGRÉE"
      },
      visualTheme: "from-teal-950 via-slate-900 to-blue-950"
    },
    {
      id: 14,
      title: "14. Centre National des Offres d'Emploi Scolaires",
      subtitle: "Plateforme de Recrutement Souveraine d'Enseignants en RDC",
      durationSeconds: 25,
      tabKey: "national_jobs",
      narratorScript: "Le Centre National des Offres d'Emploi permet aux écoles de publier leurs postes vacants et aux enseignants qualifiés de postuler à travers les 26 provinces de la République Démocratique du Congo.",
      tagline: "Le premier réseau national de recrutement d'enseignants.",
      featuresShown: [
        "Publication d'offres d'emploi par les préfets et directeurs RH",
        "Candidature en ligne avec dépôt de CV et pièces justificatives",
        "Filtres par province, commune, option et niveau d'études"
      ],
      mockDataSummary: {
        stat1Label: "Offres Nationales",
        stat1Value: "450+ Postes",
        stat2Label: "Enseignants Inscrits",
        stat2Value: "12,000+",
        badge: "RECRUTEMENT NATIONAL RDC"
      },
      visualTheme: "from-blue-950 via-cyan-950 to-slate-900"
    },
    {
      id: 15,
      title: "15. Synthèse & Adhésion à SmartSchool RDC",
      subtitle: "Rejoignez la Révolution Numérique de l'Éducation en RDC",
      durationSeconds: 25,
      tabKey: "dashboard",
      narratorScript: "SmartSchool RDC est la solution clé en main recommandée pour moderniser la gestion de vos écoles. Rejoignez dès aujourd'hui les centaines d'établissements qui nous font confiance à Kinshasa, Lubumbashi, Goma et dans toutes les provinces.",
      tagline: "SmartSchool RDC — L'Avenir de l'Éducation Congolaise.",
      featuresShown: [
        "Accompagnement et formation complète de votre personnel",
        "Déploiement garanti sous 48 heures",
        "Assistance technique locale 7j/7 basée en RDC"
      ],
      mockDataSummary: {
        stat1Label: "Contact Direct",
        stat1Value: "+243 810 000 000",
        stat2Label: "Site Officiel",
        stat2Value: "smartschool.cd",
        badge: "DÉPLOYEZ VOTRE ÉCOLE"
      },
      visualTheme: "from-blue-900 via-indigo-900 to-slate-950"
    }
  ];

  // State management
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeStudioTab, setActiveStudioTab] = useState<"player" | "script" | "screens" | "broadcast">("player");
  const [isRecording, setIsRecording] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioOscillatorRef = useRef<OscillatorNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Browser Screen / Canvas Video Recording Handler
  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Votre navigateur ne supporte pas l'enregistrement direct d'écran. Veuillez utiliser Chrome, Edge ou Firefox.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true
      });

      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp9' };
      let recorder: MediaRecorder;

      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "SmartSchool_RDC_Vidieu_Publicitaire_Officielle_1080p.webm";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Start playing video automatically
      jumpToScene(0);
      setIsPlaying(true);
    } catch (err) {
      console.error("Erreur lors du démarrage du registre vidéo:", err);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const currentScene = scenes[currentSceneIndex];

  // Web Speech API Voiceover synthesis
  const speakSceneScript = (text: string) => {
    try {
      if (!voiceoverEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = playbackSpeed;
      utterance.pitch = 1.0;

      // Try to find a nice French voice
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find(v => v.lang.includes("fr") || v.name.includes("French"));
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.onend = () => {
        if (isPlaying) {
          // Automatically jump to next scene if video playing
          handleNextScene();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (_err) {
      // Speech synthesis may be blocked in sandboxed iframe
    }
  };

  // Synthesize Background Music Beat using Web Audio API (Royal Free Cinema Ambient)
  const toggleCinematicSoundtrack = (enable: boolean) => {
    if (!enable) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Soft ambient chord synthesizer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3 note
      gain.gain.setValueAtTime(0.02, ctx.currentTime); // Soft volume

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioOscillatorRef.current = osc;
    } catch (err) {
      console.log("Audio synth note:", err);
    }
  };

  // Handle Play/Pause Toggle
  const togglePlayPause = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (nextState) {
      speakSceneScript(currentScene.narratorScript);
      toggleCinematicSoundtrack(musicEnabled);
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
    }
  };

  // Scene navigation
  const handleNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      const nextIdx = currentSceneIndex + 1;
      setCurrentSceneIndex(nextIdx);
      if (isPlaying) {
        speakSceneScript(scenes[nextIdx].narratorScript);
      }
    } else {
      setIsPlaying(false);
      window.speechSynthesis?.cancel();
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      const prevIdx = currentSceneIndex - 1;
      setCurrentSceneIndex(prevIdx);
      if (isPlaying) {
        speakSceneScript(scenes[prevIdx].narratorScript);
      }
    }
  };

  const jumpToScene = (index: number) => {
    setCurrentSceneIndex(index);
    if (isPlaying) {
      speakSceneScript(scenes[index].narratorScript);
    }
  };

  // Sync speech when scene changes manually
  useEffect(() => {
    if (isPlaying) {
      speakSceneScript(currentScene.narratorScript);
    }
  }, [currentSceneIndex]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      toggleCinematicSoundtrack(false);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER : STUDIO CINÉMATIQUE */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Film className="h-80 w-80 -mr-16 -mt-16 text-blue-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-600 text-white font-mono font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center space-x-1 shadow-xs">
                <Tv className="h-3 w-3" />
                <span>STUDIO CINÉMATIQUE OFFICIEL SMARTSCHOOL RDC</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span>QUALITÉ TV & WEB (STYLE APPLE / GOOGLE)</span>
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center space-x-3">
              <span>Vidéo Publicitaire & Démonstration en Direct</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl font-medium leading-relaxed">
              Explorez la vidéo publicitaire officielle de SmartSchool RDC. Basée intégralement sur les véritables interfaces de l'application, elle présente de façon percutante la valeur ajoutée pour les directeurs d'écoles, enseignants, parents et inspecteurs MINEPSP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-xl flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer ring-2 ring-emerald-400/30"
              >
                <Download className="h-4 w-4" />
                <span>Exporter le Fichier Vidéo (.mp4 / .webm)</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl shadow-xl flex items-center space-x-2 animate-pulse cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Arrêter & Télécharger la Vidéo MP4</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab(currentScene.tabKey)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer border border-slate-700"
            >
              <Monitor className="h-4 w-4 text-blue-400" />
              <span>Tester cette interface en direct</span>
            </button>
          </div>
        </div>
      </div>

      {/* STUDIO NAVIGATION TABS */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: "player", label: "Lecteur Vidéo & Storyboard", icon: Play },
          { id: "script", label: "Script Officiel Narration Voix-Off", icon: FileText },
          { id: "screens", label: "Captures Interfaces Réelles (15 Scènes)", icon: Layers },
          { id: "broadcast", label: "Guide de Diffusion TV & Radio", icon: Radio }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeStudioTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStudioTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 shrink-0 transition-all cursor-pointer ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PLAYER VIDÉO PUBLICITAIRE INTERACTIF */}
      {activeStudioTab === "player" && (
        <div className="space-y-6">
          {/* MAIN 16:9 CINEMATIC DISPLAY FRAME */}
          <div 
            ref={playerRef}
            className={`relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-gradient-to-br ${currentScene.visualTheme} transition-all duration-700 min-h-[480px] flex flex-col justify-between p-6 lg:p-10`}
          >
            {/* AMBIENT BACKGROUND GLOW */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* TOP BAR: WATERMARK & SCENE COUNTER */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
                  SS
                </div>
                <div>
                  <h2 className="font-black text-white text-sm uppercase tracking-wider">SMARTSCHOOL RDC</h2>
                  <span className="text-[10px] text-blue-300 font-mono font-bold tracking-widest uppercase">
                    PUBLICITÉ OFFICIELLE 2026 — SCÈNE {currentScene.id} / {scenes.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {currentScene.mockDataSummary.badge}
                </span>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs backdrop-blur-md cursor-pointer transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* MIDDLE CONTENT: CINEMATIC MOCKUP PREVIEW OF REAL INTERFACE */}
            <div className="relative z-10 my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* LEFT: TEXT & HIGHLIGHTS */}
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-300 text-xs font-bold border border-white/10">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>{currentScene.subtitle}</span>
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                  {currentScene.title}
                </h2>

                <p className="text-sm text-slate-200 leading-relaxed font-medium bg-black/30 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                  "{currentScene.narratorScript}"
                </p>

                {/* Feature Bullets */}
                <div className="space-y-2 pt-2">
                  {currentScene.featuresShown.map((ft, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{ft}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: REAL APP UI PREVIEW MOCKUP (FRAMELESS LAPTOP STYLE) */}
              <div className="lg:col-span-6">
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-3 transform hover:scale-[1.02] transition-transform">
                  {/* Mock Window Controls */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="ml-2 font-mono text-[10px] text-slate-400">smartschool.cd/{currentScene.tabKey}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                      VERITABLE ÉCRAN APP
                    </span>
                  </div>

                  {/* UI Preview Card */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                        <Monitor className="h-4 w-4 text-blue-400" />
                        <span>{currentScene.title}</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Module : {currentScene.tabKey}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">{currentScene.mockDataSummary.stat1Label}</span>
                        <span className="text-lg font-black text-white font-mono">{currentScene.mockDataSummary.stat1Value}</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">{currentScene.mockDataSummary.stat2Label}</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">{currentScene.mockDataSummary.stat2Value}</span>
                      </div>
                    </div>

                    {/* Button to test real screen */}
                    <button
                      onClick={() => onNavigateTab(currentScene.tabKey)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-colors cursor-pointer mt-2"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Ouvrir l'Interface Interactive en En Direct</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM CONTROLS & TIMELINE */}
            <div className="relative z-10 pt-4 border-t border-white/10 space-y-3">
              {/* Timeline Track */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 no-scrollbar">
                {scenes.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => jumpToScene(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentSceneIndex 
                        ? "w-10 bg-blue-500" 
                        : idx < currentSceneIndex 
                        ? "w-4 bg-emerald-500/80" 
                        : "w-4 bg-white/20 hover:bg-white/40"
                    }`}
                    title={`Scène ${s.id} : ${s.title}`}
                  />
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePrevScene}
                    disabled={currentSceneIndex === 0}
                    className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-2xl cursor-pointer transition-colors"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center space-x-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                    <span>{isPlaying ? "Pause" : "Lancer la Vidéo & Narration"}</span>
                  </button>

                  <button
                    onClick={handleNextScene}
                    disabled={currentSceneIndex === scenes.length - 1}
                    className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-2xl cursor-pointer transition-colors"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => jumpToScene(0)}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl cursor-pointer transition-colors"
                    title="Recommencer"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* Audio Toggles */}
                <div className="flex items-center space-x-3 text-xs">
                  <button
                    onClick={() => {
                      setVoiceoverEnabled(!voiceoverEnabled);
                      if (voiceoverEnabled && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer ${
                      voiceoverEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {voiceoverEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                    <span>Voix-Off {voiceoverEnabled ? "Active" : "Muet"}</span>
                  </button>

                  <button
                    onClick={() => {
                      const next = !musicEnabled;
                      setMusicEnabled(next);
                      toggleCinematicSoundtrack(next && isPlaying);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer ${
                      musicEnabled ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    <Radio className="h-3.5 w-3.5" />
                    <span>Fond Sonore {musicEnabled ? "Activé" : "Désactivé"}</span>
                  </button>

                  <select
                    value={playbackSpeed}
                    onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="bg-black/40 border border-white/20 text-white text-xs font-bold p-1.5 rounded-xl cursor-pointer"
                  >
                    <option value={1.0}>Vitesse 1.0x</option>
                    <option value={1.25}>Vitesse 1.25x</option>
                    <option value={1.5}>Vitesse 1.5x</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* STORYBOARD GRID LIST (12 SCENES) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <Film className="h-5 w-5 text-blue-600" />
                <span>Plan de Montage de la Vidéo Publicitaire (15 Scènes)</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Durée totale : 6 min 20 sec</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenes.map((sc, idx) => (
                <div
                  key={sc.id}
                  onClick={() => jumpToScene(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    idx === currentSceneIndex
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-blue-600 text-white font-mono font-black text-[9px] rounded-md uppercase">
                        SCÈNE #{sc.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{sc.durationSeconds}s</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{sc.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{sc.narratorScript}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">{sc.tagline}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTab(sc.tabKey);
                      }}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Voir Écran
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCRIPT OFFICIEL NARRATION */}
      {activeStudioTab === "script" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Script Commercial Officiel — Voix-Off & Téléprompteur</span>
                </h3>
                <p className="text-slate-500 text-xs">
                  Script de narration destiné aux studios d'enregistrement voice-over, présentateurs radio et chaînes de télévision.
                </p>
              </div>

              <button
                onClick={() => {
                  const fullText = scenes.map(s => `[SCÈNE ${s.id} - ${s.title}]\nNarrateur: ${s.narratorScript}\nSlogan: ${s.tagline}\n`).join("\n");
                  const element = document.createElement("a");
                  const file = new Blob([fullText], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = "Script_Publicitaire_SmartSchool_RDC_2026.txt";
                  document.body.appendChild(element);
                  element.click();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger le Script (TXT)</span>
              </button>
            </div>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {scenes.map(s => (
                <div key={s.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-mono font-extrabold text-[10px] rounded-md">
                      SCÈNE {s.id} ({s.durationSeconds}s)
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{s.title}</h4>
                  </div>

                  <blockquote className="p-4 bg-slate-50 dark:bg-slate-950 border-l-4 border-blue-600 rounded-r-xl italic text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-serif">
                    "{s.narratorScript}"
                  </blockquote>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                    <span><strong>Accompagnement Visuel :</strong> Écran interactif du module <em>{s.tabKey}</em></span>
                    <span><strong>Slogan Écran :</strong> {s.tagline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCÈNES & MODULES CORRESPONDANTS */}
      {activeStudioTab === "screens" && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <h4 className="font-bold">Garantie d'Authenticité des Interfaces</h4>
              <p>
                Toutes les scènes présentées dans la publicité officielle correspondent exactement aux véritables fonctionnalités opérationnelles de votre instance SmartSchool RDC.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenes.map(sc => (
              <div key={sc.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-600">Scène #{sc.id}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] rounded-md">
                      Module: {sc.tabKey}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{sc.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{sc.narratorScript}</p>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Fonctionnalités Clés Démonstratives :</span>
                    <ul className="space-y-1">
                      {sc.featuresShown.map((f, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">{sc.mockDataSummary.badge}</span>
                  <button
                    onClick={() => onNavigateTab(sc.tabKey)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Naviguer vers l'écran réel</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GUIDE BROADCAST TV & MEDIA */}
      {activeStudioTab === "broadcast" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
            <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <Radio className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight">
                  Kit de Diffusion Médias, Radio & Chaînes Télévisées RDC
                </h3>
                <p className="text-slate-500 text-xs">
                  Directives techniques pour la diffusion sur RTNC, B-One, Digital Congo, Télé 50 et réseaux sociaux.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <Tv className="h-6 w-6 text-blue-600" />
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Format TV Télévision (16:9 4K)</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Exporté en ProRes 422 60fps avec sous-titres officiels MINEPSP et audio stéréophonique normalisé à -24 LUFS.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <Smartphone className="h-6 w-6 text-emerald-600" />
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Format Réseaux (9:16 Vertical)</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Adapté pour TikTok, Instagram Reels, Facebook & WhatsApp Status pour toucher directement les tuteurs et enseignants.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <Radio className="h-6 w-6 text-amber-600" />
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Spot Radio National (30s)</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Condensé audio de 30 secondes en Français, Lingala, Swahili, Tshiluba et Kikongo pour une couverture provinciale totale.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
