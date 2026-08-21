import React, { useState, useEffect, useMemo } from "react";
import { 
  Landmark, 
  Search, 
  Filter, 
  BookOpen, 
  History, 
  Globe, 
  MapPin, 
  Calendar, 
  Award, 
  Sparkles, 
  FileText, 
  Video, 
  Plus, 
  Edit3, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  X, 
  Eye, 
  Layers, 
  HelpCircle, 
  MessageSquare, 
  Check, 
  Compass, 
  Palette, 
  Music, 
  Trophy, 
  Camera, 
  Bookmark, 
  Download, 
  ShieldCheck,
  UserCheck,
  Clock,
  Utensils,
  Book,
  FileCheck,
  Upload,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { safeLocalStorage } from "../utils/safeStorage";

export interface HeritageItem {
  id: string;
  title: string;
  category: 
    | "Histoire de la RDC"
    | "Royaume Kongo"
    | "Royaume Luba"
    | "Royaume Lunda"
    | "Période précoloniale"
    | "État Indépendant du Congo"
    | "Congo Belge"
    | "Indépendance"
    | "Première République"
    | "Deuxième République"
    | "Troisième République"
    | "Grandes dates historiques"
    | "Chronologie de la RDC"
    | "Héros nationaux"
    | "Personnalités historiques"
    | "Chefs coutumiers"
    | "Présidents de la République"
    | "Premiers ministres"
    | "Grandes figures de l'éducation"
    | "Scientifiques congolais"
    | "Artistes congolais"
    | "Écrivains"
    | "Musiciens"
    | "Sportifs"
    | "Sites touristiques"
    | "Parcs nationaux"
    | "Patrimoines culturels"
    | "Monuments historiques"
    | "Fleuves et lacs"
    | "Provinces"
    | "Langues nationales"
    | "Traditions"
    | "Faune et flore"
    | "Cartes historiques"
    | "Photos d'archives"
    | "Événements marquants"
    | "Fêtes nationales";
  province: string;
  period: string;
  dateStr: string;
  mainPhoto: string;
  gallery: string[];
  description: string;
  biography: string;
  locationCoordinates?: { lat: number; lng: number; city: string };
  videoUrl?: string;
  documents: { title: string; url: string; size: string }[];
  bibliography: string[];
  keywords: string[];
}

export interface ProvinceInfo {
  id: string;
  name: string;
  chefLieu: string;
  population: string;
  superficie: string;
  languages: string[];
  economy: string;
  culture: string;
  historicalSites: string[];
  famousSchools: string[];
  photo: string;
}

export interface PedagogicalPath {
  id: string;
  title: string;
  teacherName: string;
  targetClass: string;
  itemIds: string[];
  comments: string;
  quiz: { question: string; options: string[]; answerIndex: number }[];
  createdAt: string;
}

interface NationalCultureHeritageModuleProps {
  userRole?: string;
  userName?: string;
  userPortal?: "eleve" | "enseignant" | "parent" | "admin" | "superadmin";
  onAuditLog?: (action: string, details: string) => void;
}

export const HERITAGE_CATEGORIES = [
  "Tous",
  "Histoire de la RDC",
  "Royaume Kongo",
  "Royaume Luba",
  "Royaume Lunda",
  "Période précoloniale",
  "État Indépendant du Congo",
  "Congo Belge",
  "Indépendance",
  "Première République",
  "Deuxième République",
  "Troisième République",
  "Grandes dates historiques",
  "Héros nationaux",
  "Personnalités historiques",
  "Chefs coutumiers",
  "Présidents de la République",
  "Premiers ministres",
  "Grandes figures de l'éducation",
  "Scientifiques congolais",
  "Artistes congolais",
  "Écrivains",
  "Musiciens",
  "Sportifs",
  "Sites touristiques",
  "Parcs nationaux",
  "Patrimoines culturels",
  "Monuments historiques",
  "Fleuves et lacs",
  "Provinces",
  "Langues nationales",
  "Traditions",
  "Faune et flore",
  "Cartes historiques",
  "Photos d'archives",
  "Événements marquants",
  "Fêtes nationales"
] as const;

export const PROVINCES_RDC_LIST = [
  "Toutes",
  "Kinshasa",
  "Kongo-Central",
  "Kwango",
  "Kwilu",
  "Mai-Ndombe",
  "Kasaï",
  "Kasaï-Central",
  "Kasaï-Oriental",
  "Lomami",
  "Sankuru",
  "Maniema",
  "Sud-Kivu",
  "Nord-Kivu",
  "Ituri",
  "Haut-Uele",
  "Tshopo",
  "Bas-Uele",
  "Nord-Ubangi",
  "Mongala",
  "Sud-Ubangi",
  "Équateur",
  "Tshuapa",
  "Tanganyika",
  "Haut-Lomami",
  "Lualaba",
  "Haut-Katanga"
];

// FICHES OFFICIELLES DES 26 PROVINCES DE LA RDC
export const PROVINCES_DATA: ProvinceInfo[] = [
  {
    id: "prov-kin",
    name: "Kinshasa",
    chefLieu: "Kinshasa (Capitale)",
    population: "~17.000.000 hab.",
    superficie: "9.965 km²",
    languages: ["Lingala", "Français"],
    economy: "Services, Finances, Industrie, Commerce International, Ports Fluviaux",
    culture: "Berceau de la Rumba Congolaise, Sape, Arts plastiques de l'Académie des Beaux-Arts",
    historicalSites: ["Mémorial Patrice Lumumba", "Palais de la Nation", "Musée National de la RDC", "Chutes de la Joliette"],
    famousSchools: ["Collège Boboto", "Lycée Sainte-Marie de la Gombe", "Athénée de la Gombe", "Université de Kinshasa (UNIKIN)"],
    photo: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "prov-kc",
    name: "Kongo-Central",
    chefLieu: "Matadi",
    population: "~6.800.000 hab.",
    superficie: "53.920 km²",
    languages: ["Kikongo", "Lingala"],
    economy: "Port de Matadi et Boma, Barrage d'Inga, Agriculture, Cimenteries, Pétrole (Moanda)",
    culture: "Ancien Royaume Kongo, Cité Sainte de Nkamba, Traditions Bakongo",
    historicalSites: ["Cité Sainte de Nkamba", "Pont Maréchal Mobutu", "Chutes de Zongo", "Jardin Botanique de Kisantu"],
    famousSchools: ["Collège Notre-Dame de Mbanza-Mboma", "Institut Nsona-Pangu", "Université Kimbanguiste"],
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "prov-sankuru",
    name: "Sankuru",
    chefLieu: "Lusambo",
    population: "~2.500.000 hab.",
    superficie: "104.331 km²",
    languages: ["Tshiluba", "Otetela"],
    economy: "Agriculture (Riz, Coton, Maïs), Forêt, Élevage",
    culture: "Terre natale du Héros National Patrice Émery Lumumba (Onalua)",
    historicalSites: ["Village Historique d'Onalua", "Rivière Sankuru", "Paysage Forestier du Sankuru"],
    famousSchools: ["Institut Lumumba de Lodja", "Complexe Scolaire Saint-Joseph"],
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Patrice_Lumumba_1960.jpg/600px-Patrice_Lumumba_1960.jpg"
  },
  {
    id: "prov-nordkivu",
    name: "Nord-Kivu",
    chefLieu: "Goma",
    population: "~8.100.000 hab.",
    superficie: "59.483 km²",
    languages: ["Swahili", "Kinyarwanda", "Kinande"],
    economy: "Commerce Transfrontalier, Agriculture (Café, Thé, Pomme de terre), Tourisme",
    culture: "Danse Nande, Richesse artisanale de Butembo, Résilience culturelle",
    historicalSites: ["Parc National des Virunga (UNESCO)", "Volcan Nyiragongo", "Lac Kivu"],
    famousSchools: ["Institut Goma", "Lycée Amani de Goma", "Université de Goma (UNIGOM)"],
    photo: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "prov-sudkivu",
    name: "Sud-Kivu",
    chefLieu: "Bukavu",
    population: "~7.000.000 hab.",
    superficie: "65.070 km²",
    languages: ["Swahili", "Mashi"],
    economy: "Mines (Or, Coltan), Pêche sur le Lac Kivu, Agriculture (Quinquina, Thé)",
    culture: "Architecture coloniale de Bukavu, Traditions Shi, Musique Kivu",
    historicalSites: ["Parc National de Kahuzi-Biega (Gorilles de plaine)", "Île d'Idjwi", "Cathédrale Notre-Dame de Bukavu"],
    famousSchools: ["Collège Alfajiri de Bukavu", "Lycée Wima", "Université Catholique de Bukavu (UCB)"],
    photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "prov-hautkatanga",
    name: "Haut-Katanga",
    chefLieu: "Lubumbashi",
    population: "~5.700.000 hab.",
    superficie: "132.425 km²",
    languages: ["Swahili", "Bemba"],
    economy: "Poumon Minier (Cuivre, Cobalt), Industrie Lourde, Énergie",
    culture: "Musique Katangaise, Peinture populaire, Patrimoine Industriel",
    historicalSites: ["Théâtre de Lubumbashi", "Musée National de Lubumbashi", "Lac Moero"],
    famousSchools: ["Collège Imara", "Lycée Tuendelee", "Université de Lubumbashi (UNILU)"],
    photo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800"
  }
];

export function NationalCultureHeritageModule({
  userRole = "Directeur",
  userName = "Enseignant RDC",
  userPortal = "admin",
  onAuditLog
}: NationalCultureHeritageModuleProps) {

  // Check Emergency Kill Switch Status from Owner Control Center
  const isModuleDisabled = useMemo(() => {
    try {
      const savedMap = safeLocalStorage.getItem("ss_owner_kill_switches");
      if (savedMap) {
        const parsed = JSON.parse(savedMap);
        return parsed["culture_patrimoine_rdc"] === true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }, []);

  // Main Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    "library" | "timeline" | "provinces" | "culture" | "pedagogy" | "favorites"
  >("library");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [selectedProvince, setSelectedProvince] = useState<string>("Toutes");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Toutes");

  // Favorites Saved locally
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = safeLocalStorage.getItem("ss_heritage_user_favorites");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return ["her-001", "her-003"];
  });

  // Heritage Items List
  const [items, setItems] = useState<HeritageItem[]>(() => {
    const saved = safeLocalStorage.getItem("ss_national_heritage_items");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "her-001",
        title: "Patrice Emery Lumumba",
        category: "Héros nationaux",
        province: "Sankuru",
        period: "Indépendance (1960)",
        dateStr: "2 juillet 1925 - 17 janvier 1961",
        mainPhoto: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Patrice_Lumumba_1960.jpg/600px-Patrice_Lumumba_1960.jpg",
        gallery: [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Patrice_Lumumba_1960.jpg/600px-Patrice_Lumumba_1960.jpg",
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Héros national et Premier ministre de la République du Congo (actuelle RDC) lors de l'accession à l'indépendance le 30 juin 1960.",
        biography: "Patrice Émery Lumumba est une figure internationale du panafricanisme et de la lutte pour la souveraineté du Congo. Son discours historique du 30 juin 1960 devant le Roi Baudouin symbolise le courage et la dignité du peuple congolais.",
        locationCoordinates: { lat: -4.325, lng: 15.3222, city: "Kinshasa / Onalua" },
        videoUrl: "https://www.youtube.com/watch?v=sample",
        documents: [
          { title: "Discours Historique du 30 Juin 1960 (PDF)", url: "#", size: "1.2 MB" },
          { title: "Biographie Officielle Patrice Lumumba EPST (PDF)", url: "#", size: "2.5 MB" }
        ],
        bibliography: ["J. Gérard-Libois, 'Congo 1960', CRISP, 1961.", "Ludo De Witte, 'L'assassinat de Lumumba', Karthala."],
        keywords: ["Lumumba", "Indépendance", "Héros National", "Sankuru", "30 Juin", "Panafricanisme"]
      },
      {
        id: "her-002",
        title: "M'zee Laurent-Désiré Kabila",
        category: "Héros nationaux",
        province: "Haut-Katanga",
        period: "Troisième République",
        dateStr: "27 novembre 1939 - 16 janvier 2001",
        mainPhoto: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
        gallery: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800"],
        description: "Héros national, troisième Président de la République Démocratique du Congo et artisan du changement de régime en mai 1997.",
        biography: "Surnommé le 'Soldat du Peuple', M'zee Laurent-Désiré Kabila a mené la révolution de l'AFDL pour restaurer le nom de 'République Démocratique du Congo' le 17 mai 1997. Il est célèbre pour sa devise 'Ne jamais trahir le Congo'.",
        locationCoordinates: { lat: -4.3, lng: 15.3, city: "Kinshasa / Ankoro" },
        documents: [{ title: "Actes de la Révolution du 17 Mai 1997 (PDF)", url: "#", size: "1.8 MB" }],
        bibliography: ["Archives Historiques de la RDC."],
        keywords: ["Kabila", "AFDL", "17 Mai", "Héros National", "Patriote"]
      },
      {
        id: "her-003",
        title: "Le Royaume Kongo (1390 - 1914)",
        category: "Royaume Kongo",
        province: "Kongo-Central",
        period: "Période précoloniale",
        dateStr: "1390 - 1914",
        mainPhoto: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
        gallery: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"],
        description: "Grand empire d'Afrique centrale fondé par Ntinu Wene, réputé pour sa structure administrative avancée, son réseau commercial et sa diplomatie.",
        biography: "Le Royaume Kongo s'étendait sur le Congo actuel, l'Angola et le Gabon. Sa capitale Mbanza Kongo était un centre politique et culturel majeur avant les premiers contacts avec les explorateurs portugais en 1482.",
        locationCoordinates: { lat: -5.8, lng: 13.5, city: "Mbanza Kongo / Mbanza-Ngungu" },
        documents: [{ title: "Charte Administrative du Royaume Kongo (PDF)", url: "#", size: "2.8 MB" }],
        bibliography: ["J. Vansina, 'Les anciens royaumes de la savane', 1965."],
        keywords: ["Kongo", "Ntinu Wene", "Mbanza Kongo", "Mani Kongo", "Histoire"]
      },
      {
        id: "her-004",
        title: "Simon Kimbangu",
        category: "Personnalités historiques",
        province: "Kongo-Central",
        period: "Congo Belge",
        dateStr: "12 septembre 1887 - 12 octobre 1951",
        mainPhoto: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
        gallery: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800"],
        description: "Prophète et précurseur de l'éveil spirituel et patriotique congolais, condamné à 30 ans de prison par le régime colonial.",
        biography: "Simon Kimbangu débute son ministère le 6 avril 1921 à Nkamba. Son message de dignité spirituelle et d'émancipation politique suscite une immense adhésion populaire. Le 6 avril est décrété Journée Fériée Nationale en son honneur.",
        locationCoordinates: { lat: -5.1333, lng: 14.8, city: "Nkamba" },
        documents: [{ title: "Histoire du Kimbanguisme et de la Libération (PDF)", url: "#", size: "1.4 MB" }],
        bibliography: ["S. Asch, 'Le Kimbanguisme', Harmattan."],
        keywords: ["Simon Kimbangu", "Nkamba", "6 Avril", "Éveil National"]
      },
      {
        id: "her-005",
        title: "Parc National des Virunga",
        category: "Parcs nationaux",
        province: "Nord-Kivu",
        period: "Patrimoine Naturel Mondial",
        dateStr: "Fondé en 1925",
        mainPhoto: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800",
        gallery: [
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Plus ancien parc national d'Afrique et joyau de la biodiversité mondiale, abritant les gorilles de montagne et le volcan Nyiragongo.",
        biography: "Classé au patrimoine mondial de l'UNESCO en 1979, le Parc des Virunga couvre 7 800 km² au Nord-Kivu. Il abrite une faune exceptionnelle : gorilles, chimpanzés, okapis, éléphants et hippopotames.",
        locationCoordinates: { lat: -1.4167, lng: 29.4167, city: "Goma" },
        documents: [{ title: "Fiche Pédagogique - Faune & Flore des Virunga (PDF)", url: "#", size: "3.1 MB" }],
        bibliography: ["Rapports UNESCO & ICCN."],
        keywords: ["Virunga", "Gorilles", "Nyiragongo", "UNESCO", "Biodiversité"]
      },
      {
        id: "her-006",
        title: "La Rumba Congolaise (Patrimoine Immériel UNESCO)",
        category: "Patrimoines culturels",
        province: "Kinshasa",
        period: "Patrimoine Culturel",
        dateStr: "Inscrite à l'UNESCO en 2021",
        mainPhoto: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
        gallery: ["https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800"],
        description: "Musique emblématique congolaise symbole de cohésion sociale, de poésie et d'élégance vestimentaire.",
        biography: "Inscrite au Patrimoine Culturel Immatériel de l'Humanité par l'UNESCO le 14 décembre 2021, la Rumba Congolaise rassemble les grands maîtres comme Franco Luambo, Tabu Ley Rochereau, Joseph Kabasele (Le Grand Kallé) et Papa Wemba.",
        locationCoordinates: { lat: -4.325, lng: 15.3222, city: "Kinshasa / Brazzaville" },
        documents: [{ title: "Dossier UNESCO de la Rumba Congolaise (PDF)", url: "#", size: "2.0 MB" }],
        bibliography: ["Mwenze Kibwang, 'Histoire de la Musique Congolaise'."],
        keywords: ["Rumba", "UNESCO", "Musique", "Franco", "Tabu Ley", "Papa Wemba"]
      }
    ];
  });

  // Pedagogical Paths State
  const [paths, setPaths] = useState<PedagogicalPath[]>(() => {
    const saved = safeLocalStorage.getItem("ss_heritage_pedagogical_paths");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "path-1",
        title: "Parcours 6è : Les Pères de l'Indépendance & Panafricanisme",
        teacherName: "Prof. Dieudonné Kabangu",
        targetClass: "6ème Humanités Scientifiques",
        itemIds: ["her-001", "her-002", "her-004"],
        comments: "Ce parcours prépare les élèves au concours d'histoire et d'éducation civique sur la souveraineté nationale.",
        quiz: [
          {
            question: "Quel jour la RDC a-t-elle proclamé son indépendance ?",
            options: ["30 Juin 1960", "17 Mai 1997", "4 Janvier 1959", "6 Avril 1921"],
            answerIndex: 0
          },
          {
            question: "Qui a prononcé le discours mémorable sur la dignité du peuple congolais le 30 juin 1960 ?",
            options: ["Joseph Kasa-Vubu", "Patrice Émery Lumumba", "Simon Kimbangu", "Moïse Tshombe"],
            answerIndex: 1
          }
        ],
        createdAt: "2026-08-01"
      }
    ];
  });

  // Modals & Active Detail States
  const [selectedItemDetail, setSelectedItemDetail] = useState<HeritageItem | null>(null);
  const [selectedProvinceDetail, setSelectedProvinceDetail] = useState<ProvinceInfo | null>(null);

  // Admin Add / Edit Modal State
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<Partial<HeritageItem>>({
    title: "",
    category: "Histoire de la RDC",
    province: "Kinshasa",
    period: "Période Contemporaine",
    dateStr: "",
    mainPhoto: "",
    description: "",
    biography: "",
    keywords: []
  });

  // Teacher New Path Modal
  const [newPathModalOpen, setNewPathModalOpen] = useState<boolean>(false);
  const [pathForm, setPathForm] = useState({
    title: "",
    targetClass: "6ème Humanités",
    comments: "",
    selectedItemIds: [] as string[]
  });

  // Active Quiz View State
  const [activeQuizPath, setActiveQuizPath] = useState<PedagogicalPath | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Feedback Message
  const [successMsg, setSuccessMsg] = useState<string>("");

  // LocalStorage Sync
  useEffect(() => {
    safeLocalStorage.setItem("ss_national_heritage_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_heritage_pedagogical_paths", JSON.stringify(paths));
  }, [paths]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_heritage_user_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Toggle Favorite Action
  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(itemId);
      const updated = isFav ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      return updated;
    });
  };

  // Derived Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== "Tous" && item.category !== selectedCategory) return false;
      if (selectedProvince !== "Toutes" && item.province !== selectedProvince) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.biography.toLowerCase().includes(q) ||
          item.province.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, selectedCategory, selectedProvince, searchQuery]);

  // Save Item (Admin Add / Edit)
  const handleSaveItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title?.trim() || !itemForm.mainPhoto?.trim()) {
      alert("Veuillez renseigner le titre et la photo principale.");
      return;
    }

    if (editingItemId) {
      setItems((prev) =>
        prev.map((it) => (it.id === editingItemId ? ({ ...it, ...itemForm } as HeritageItem) : it))
      );
      if (onAuditLog) {
        onAuditLog("Modification Patrimoine National", `Mise à jour de la fiche '${itemForm.title}' (ID: ${editingItemId}).`);
      }
      setSuccessMsg("Fiche du patrimoine mise à jour avec succès !");
    } else {
      const newItem: HeritageItem = {
        id: `her-${Date.now()}`,
        title: itemForm.title.trim(),
        category: (itemForm.category as any) || "Histoire de la RDC",
        province: itemForm.province || "Kinshasa",
        period: itemForm.period || "Période Contemporaine",
        dateStr: itemForm.dateStr || "N/A",
        mainPhoto: itemForm.mainPhoto.trim(),
        gallery: [itemForm.mainPhoto.trim()],
        description: itemForm.description || "",
        biography: itemForm.biography || "",
        documents: [],
        bibliography: [],
        keywords: [itemForm.title.trim(), itemForm.province || "Kinshasa"]
      };

      setItems((prev) => [newItem, ...prev]);
      if (onAuditLog) {
        onAuditLog("Ajout Patrimoine National", `Création de la fiche de patrimoine '${newItem.title}' dans la rubrique ${newItem.category}.`);
      }
      setSuccessMsg("Nouvelle fiche du patrimoine enregistrée et publiée avec succès !");
    }

    setAdminModalOpen(false);
    setEditingItemId(null);
    setItemForm({ title: "", category: "Histoire de la RDC", province: "Kinshasa", period: "Période Contemporaine", dateStr: "", mainPhoto: "", description: "", biography: "" });
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Delete Item (Admin)
  const handleDeleteItem = (id: string, title: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer définitivement la fiche '${title}' du patrimoine national ?`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (onAuditLog) {
        onAuditLog("Suppression Patrimoine National", `Suppression de la fiche '${title}' (ID: ${id}).`);
      }
      setSuccessMsg(`Fiche '${title}' supprimée.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  // Create Pedagogical Path (Teacher)
  const handleCreatePathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathForm.title.trim() || pathForm.selectedItemIds.length === 0) {
      alert("Veuillez entrer un titre et sélectionner au moins une ressource.");
      return;
    }

    const newPath: PedagogicalPath = {
      id: `path-${Date.now()}`,
      title: pathForm.title.trim(),
      teacherName: userName || "Enseignant RDC",
      targetClass: pathForm.targetClass,
      itemIds: pathForm.selectedItemIds,
      comments: pathForm.comments.trim(),
      quiz: [
        {
          question: `Question sur le parcours : ${pathForm.title}`,
          options: ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
          answerIndex: 0
        }
      ],
      createdAt: new Date().toLocaleDateString("fr-FR")
    };

    setPaths((prev) => [newPath, ...prev]);
    setNewPathModalOpen(false);
    setPathForm({ title: "", targetClass: "6ème Humanités", comments: "", selectedItemIds: [] });

    if (onAuditLog) {
      onAuditLog("Création Parcours Pédagogique", `L'enseignant ${userName} a créé le parcours '${newPath.title}' pour la classe ${newPath.targetClass}.`);
    }

    setSuccessMsg("Parcours pédagogique créé et publié pour vos élèves !");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Submit Quiz Action (Student/Teacher)
  const handleQuizSubmit = () => {
    if (!activeQuizPath) return;
    let scoreCount = 0;
    activeQuizPath.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answerIndex) {
        scoreCount += 1;
      }
    });
    const finalScore = Math.round((scoreCount / activeQuizPath.quiz.length) * 100);
    setQuizScore(finalScore);
    setQuizSubmitted(true);

    if (onAuditLog) {
      onAuditLog("Évaluation Quiz Patrimoine", `${userName} a complété le quiz '${activeQuizPath.title}' avec un score de ${finalScore}%.`);
    }
  };

  if (isModuleDisabled) {
    return (
      <div className="p-8 bg-red-950/20 border-2 border-red-500/50 rounded-3xl text-left space-y-4 text-white">
        <div className="flex items-center space-x-3 text-red-500 font-black text-xl uppercase">
          <Landmark className="h-8 w-8" />
          <span>Module Temporairement Désactivé (Mode d'Urgence)</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Le Centre National de la Culture, de l'Histoire et du Patrimoine de la RDC est actuellement suspendu par le Propriétaire de SmartSchool RDC en mode d'urgence ou de maintenance réglementaire.
        </p>
        <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-2xl text-xs font-mono text-red-200">
          Statut : Hors-ligne par ordre de la Direction Générale / Propriétaire. Les accès seront rétablis automatiquement dès la fin de la maintenance.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left" id="national-culture-heritage-module">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-slate-950 text-white p-6 rounded-3xl shadow-xl border border-amber-700/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-amber-400/40">
              <Landmark className="h-3.5 w-3.5 text-amber-400" /> Centre National de la Culture, de l'Histoire et du Patrimoine RDC
            </span>
            <span className="text-amber-200/60 text-xs font-mono">• Ministère de l'EPST & Culture</span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight">
            Bibliothèque Numérique Officielle de la RDC
          </h2>

          <p className="text-xs lg:text-sm text-amber-100/90 max-w-4xl leading-relaxed">
            Encyclopédie éducative nationale : Découvrez l'histoire des Grands Royaumes (Kongo, Luba, Lunda), les Héros Nationaux, les 26 Provinces, la Rumba Congolaise, les Parcs Nationaux UNESCO et les archives documentaires officielles.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          {(userRole === "Super Administrateur" || userRole === "Directeur" || userRole === "ADMINISTRATEUR NATIONAL EPST" || userPortal === "superadmin") && (
            <button
              onClick={() => {
                setEditingItemId(null);
                setItemForm({ title: "", category: "Histoire de la RDC", province: "Kinshasa", period: "Période Contemporaine", dateStr: "", mainPhoto: "", description: "", biography: "" });
                setAdminModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une Fiche Patrimoine</span>
            </button>
          )}

          <button
            onClick={() => setNewPathModalOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 backdrop-blur-md transition-all cursor-pointer border border-white/20"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Créer un Parcours Pédagogique</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK SUCCESS BANNER */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-600 text-white rounded-2xl shadow-md flex items-center justify-between font-bold text-xs"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-white hover:text-emerald-100">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN NAVIGATION BAR */}
      <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "library"
                ? "bg-amber-900 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="h-4 w-4 text-amber-500" />
            <span>Encyclopédie & Médias ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "timeline"
                ? "bg-amber-900 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Chronologie Historique</span>
          </button>

          <button
            onClick={() => setActiveTab("provinces")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "provinces"
                ? "bg-amber-900 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Globe className="h-4 w-4 text-emerald-500" />
            <span>Les 26 Provinces</span>
          </button>

          <button
            onClick={() => setActiveTab("culture")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "culture"
                ? "bg-amber-900 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Music className="h-4 w-4 text-rose-500" />
            <span>Culture & Rumba UNESCO</span>
          </button>

          <button
            onClick={() => setActiveTab("pedagogy")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "pedagogy"
                ? "bg-amber-900 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span>Parcours Enseignants ({paths.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "favorites"
                ? "bg-amber-900 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bookmark className="h-4 w-4 text-amber-500" />
            <span>Mes Favoris ({favorites.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
          <span>Contenu Homologué EPST RDC</span>
        </div>
      </div>

      {/* TAB 1: ENCYCLOPÉDIE MEDIA & SEARCH */}
      {activeTab === "library" && (
        <div className="space-y-6">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un héros, royaume, monument, événement..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Province Selector */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Filter par Province :</span>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                >
                  {PROVINCES_RDC_LIST.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CATEGORY BADGES SCROLLABLE */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Rubriques Pédagogiques Officielles :</span>
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-bold scrollbar-thin">
                {HERITAGE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GRID OF HERITAGE ITEMS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isFav = favorites.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  {/* Photo & Badge */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img
                      src={item.mainPhoto}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-600 text-white font-black text-[9px] rounded-lg uppercase shadow-md">
                      {item.category}
                    </span>

                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                        isFav ? "bg-amber-500 text-slate-950" : "bg-slate-900/80 text-white hover:bg-slate-800"
                      }`}
                      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-black text-sm uppercase line-clamp-1">{item.title}</h3>
                      <p className="text-[10px] text-amber-200/90 font-mono">{item.province} • {item.dateStr}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.slice(0, 3).map((kw) => (
                        <span key={kw} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[9px] rounded">
                          #{kw}
                        </span>
                      ))}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedItemDetail(item)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Consulter la Fiche</span>
                      </button>

                      {(userRole === "Super Administrateur" || userRole === "Directeur" || userRole === "ADMINISTRATEUR NATIONAL EPST") && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setItemForm(item);
                              setAdminModalOpen(true);
                            }}
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            className="p-2 bg-red-100 dark:bg-red-950 hover:bg-red-200 text-red-600 dark:text-red-400 rounded-lg cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                <Landmark className="h-10 w-10 mx-auto text-amber-500/50" />
                <p className="font-bold text-sm">Aucune ressource ne correspond aux critères de recherche.</p>
                <p className="text-xs">Modifiez la catégorie ou réinitialisez la recherche.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: INTERACTIVE TIMELINE (CHRONOLOGIE HISTORIQUE DE LA RDC) */}
      {activeTab === "timeline" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="border-b pb-3">
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span>Chronologie Historique de la République Démocratique du Congo</span>
            </h3>
            <p className="text-xs text-slate-500">
              Repères chronologiques majeurs, des Grands Royaumes précoloniaux jusqu'à l'ère contemporaine.
            </p>
          </div>

          <div className="relative border-l-2 border-amber-500/40 ml-4 pl-6 space-y-8">
            
            {/* Event 1 */}
            <div className="relative group">
              <div className="absolute -left-[31px] top-0 p-1.5 bg-amber-500 text-slate-950 rounded-full font-black text-xs">
                1390
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-600">Royaumes Précoloniaux</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Fondation du Royaume Kongo & Mbanza Kongo</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Ntinu Wene réunit les provinces bakongo et établit la capitale Mbanza Kongo. Développement du commerce, de la diplomatie et de la métallurgie.
                </p>
              </div>
            </div>

            {/* Event 2 */}
            <div className="relative group">
              <div className="absolute -left-[31px] top-0 p-1.5 bg-amber-500 text-slate-950 rounded-full font-black text-xs">
                1580
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-600">Royaumes Luba & Lunda</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Apogée des Royaumes Luba & Empire Lunda</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Kalala Ilunga développe l'Empire Luba. Création de l'Empire Lunda par Mwata Yamvo étendu sur l'Afrique centrale.
                </p>
              </div>
            </div>

            {/* Event 3 */}
            <div className="relative group">
              <div className="absolute -left-[31px] top-0 p-1.5 bg-amber-500 text-slate-950 rounded-full font-black text-xs">
                1885
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-rose-600">Conférence de Berlin</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Création de l'État Indépendant du Congo (EIC)</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Délimitation des frontières nationales actuelles sous le régime personnel du Roi Léopold II.
                </p>
              </div>
            </div>

            {/* Event 4 */}
            <div className="relative group">
              <div className="absolute -left-[31px] top-0 p-1.5 bg-amber-500 text-slate-950 rounded-full font-black text-xs">
                1960
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-600">Souveraineté Nationale</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">30 Juin 1960 : Proclamation de l'Indépendance</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Joseph Kasa-Vubu devient premier Président et Patrice Émery Lumumba premier Premier ministre de la République du Congo.
                </p>
              </div>
            </div>

            {/* Event 5 */}
            <div className="relative group">
              <div className="absolute -left-[31px] top-0 p-1.5 bg-amber-500 text-slate-950 rounded-full font-black text-xs">
                1997
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-600">Troisième République</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">17 Mai 1997 : Restauration du Nom RDC</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Prise de pouvoir par M'zee Laurent-Désiré Kabila et retour officiel de l'appellation "République Démocratique du Congo".
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: FICHE DES 26 PROVINCES */}
      {activeTab === "provinces" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="border-b pb-3">
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
              <Globe className="h-5 w-5 text-emerald-500" />
              <span>Cartographie & Fiches des 26 Provinces de la RDC</span>
            </h3>
            <p className="text-xs text-slate-500">
              Découvrez la géographie, le chef-lieu, la population, l'économie et le patrimoine culturel de chaque province.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PROVINCES_DATA.map((prov) => (
              <div
                key={prov.id}
                className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-amber-500 transition-all p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-amber-600">Province</span>
                    <span className="text-[10px] font-mono text-slate-400">{prov.superficie}</span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase">{prov.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">Chef-lieu : {prov.chefLieu}</p>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <p><strong>Population :</strong> {prov.population}</p>
                  <p><strong>Langues :</strong> {prov.languages.join(", ")}</p>
                  <p className="line-clamp-2"><strong>Économie :</strong> {prov.economy}</p>
                </div>

                <button
                  onClick={() => setSelectedProvinceDetail(prov)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Voir Fiche Province Complète
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CULTURE & RUMBA UNESCO */}
      {activeTab === "culture" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="border-b pb-3">
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
              <Music className="h-5 w-5 text-rose-500" />
              <span>Patrimoine Culturel, Gastronomie & Rumba Congolaise UNESCO</span>
            </h3>
            <p className="text-xs text-slate-500">
              Richesse linguistique (Lingala, Swahili, Kikongo, Tshiluba), traditions culinaires, Sape et instruments traditionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Langues Nationales */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center space-x-2">
                <Book className="h-5 w-5 text-amber-600" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase">Les 4 Langues Nationales & Français</h4>
              </div>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                <li><strong>Lingala :</strong> Parlé à Kinshasa, Équateur et le long du Fleuve Congo. Langue de la Rumba.</li>
                <li><strong>Swahili (Kiswahili) :</strong> Parlé dans l'Est (Nord-Kivu, Sud-Kivu, Katanga, Maniema, Ituri).</li>
                <li><strong>Kikongo (Kikongo ya Leta) :</strong> Parlé dans le Kongo-Central, Kwango, Kwilu, Mai-Ndombe.</li>
                <li><strong>Tshiluba :</strong> Parlé dans le Grand Kasaï (Kasaï, Kasaï-Central, Kasaï-Oriental, Lomami, Sankuru).</li>
              </ul>
            </div>

            {/* Gastronomie */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-rose-600" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase">Gastronomie Traditionnelle RDC</h4>
              </div>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                <li><strong>Poulet à la Moambe :</strong> Plat national aux noix de palme râpées avec chikwangue.</li>
                <li><strong>Pondu (Feuilles de Manioc) :</strong> Préparation traditionnelle servie avec poisson fumé ou fufu.</li>
                <li><strong>Liboke de Poisson :</strong> Poisson braisé en papillote de feuilles de bananier.</li>
                <li><strong>Makayabu & Mbisi ya Mai :</strong> Poisson salé et poissons du Fleuve Congo.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB 5: PARCOURS PÉDAGOGIQUES (ENSEIGNANT) */}
      {activeTab === "pedagogy" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Parcours Pédagogiques & Quiz Créés par les Enseignants</span>
              </h3>
              <p className="text-xs text-slate-500">
                Chaque enseignant peut structurer une leçon thématique sur le patrimoine et tester les connaissances de sa classe.
              </p>
            </div>

            <button
              onClick={() => setNewPathModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Créer un Parcours</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paths.map((path) => (
              <div key={path.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-extrabold text-[10px] rounded-full uppercase">
                    {path.targetClass}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{path.createdAt}</span>
                </div>

                <h4 className="font-black text-sm text-slate-900 dark:text-white">{path.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{path.comments}"</p>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Auteur : {path.teacherName}</span>
                  <button
                    onClick={() => {
                      setActiveQuizPath(path);
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                      setQuizScore(null);
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-500 cursor-pointer shadow-xs"
                  >
                    Passer le Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FAVORIS */}
      {activeTab === "favorites" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="border-b pb-3">
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
              <Bookmark className="h-5 w-5 text-amber-500" />
              <span>Vos Ressources Favoris Enregistrées ({favorites.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Retrouvez rapidement les fiches historiques et géographiques que vous avez sauvegardées.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items
              .filter((i) => favorites.includes(i.id))
              .map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.category} • {item.province}</p>
                  <button
                    onClick={() => setSelectedItemDetail(item)}
                    className="w-full py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl"
                  >
                    Ouvrir Fiche
                  </button>
                </div>
              ))}

            {favorites.length === 0 && (
              <p className="col-span-full text-center text-xs text-slate-400 py-8">
                Aucun favori enregistré. Cliquez sur le marque-page d'une fiche pour la sauvegarder.
              </p>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR HERITAGE ITEM */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header Image */}
            <div className="h-60 relative bg-slate-950 flex items-center justify-center">
              {selectedItemDetail.mainPhoto ? (
                <img src={selectedItemDetail.mainPhoto} alt={selectedItemDetail.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-500 font-bold text-sm uppercase">Patrimoine National RDC</div>
              )}
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 text-white rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 bg-amber-600 text-white font-black text-[9px] rounded uppercase mb-1 inline-block">
                  {selectedItemDetail.category}
                </span>
                <h2 className="text-2xl font-black uppercase">{selectedItemDetail.title}</h2>
                <p className="text-xs text-amber-200/90 font-mono">{selectedItemDetail.province} • {selectedItemDetail.dateStr}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-extrabold text-xs uppercase text-amber-600 mb-1">Résumé Officiel</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{selectedItemDetail.description}</p>
              </div>

              <div>
                <h4 className="font-extrabold text-xs uppercase text-amber-600 mb-1">Biographie & Récit Historique</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{selectedItemDetail.biography}</p>
              </div>

              {/* Documents Attachments */}
              {selectedItemDetail.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase text-amber-600">Documents Pédagogiques Complémentaires</h4>
                  <div className="space-y-1.5">
                    {selectedItemDetail.documents.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-amber-600" />
                          <span className="font-bold text-slate-800 dark:text-white">{doc.title}</span>
                        </div>
                        <button className="px-3 py-1 bg-amber-600 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                          Télécharger ({doc.size})
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedItemDetail(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Fermer la Fiche
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PROVINCE DETAIL MODAL */}
      {selectedProvinceDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600">Fiche Province RDC</span>
                <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase">{selectedProvinceDetail.name}</h3>
              </div>
              <button onClick={() => setSelectedProvinceDetail(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p><strong>Chef-lieu :</strong> {selectedProvinceDetail.chefLieu}</p>
              <p><strong>Population :</strong> {selectedProvinceDetail.population} • <strong>Superficie :</strong> {selectedProvinceDetail.superficie}</p>
              <p><strong>Langues Parlées :</strong> {selectedProvinceDetail.languages.join(", ")}</p>
              <p><strong>Activité Économique :</strong> {selectedProvinceDetail.economy}</p>
              <p><strong>Patrimoine Culturel :</strong> {selectedProvinceDetail.culture}</p>
              <div>
                <strong>Sites Historiques & Touristiques :</strong>
                <ul className="list-disc pl-4 mt-1">
                  {selectedProvinceDetail.historicalSites.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Établissements Scolaires Célèbres :</strong>
                <ul className="list-disc pl-4 mt-1">
                  {selectedProvinceDetail.famousSchools.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedProvinceDetail(null)}
                className="px-5 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Fermer Fiche Province
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ADD / EDIT MODAL */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Landmark className="h-4 w-4 text-amber-600" />
                <span>{editingItemId ? "Modifier Fiche Patrimoine" : "Ajouter au Patrimoine National"}</span>
              </h3>
              <button onClick={() => setAdminModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Titre de la Fiche *</label>
                <input
                  type="text"
                  required
                  value={itemForm.title}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Joseph Kasa-Vubu"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Rubrique / Catégorie *</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {HERITAGE_CATEGORIES.filter((c) => c !== "Tous").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Province Concernée *</label>
                  <select
                    value={itemForm.province}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, province: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {PROVINCES_RDC_LIST.filter((p) => p !== "Toutes").map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">URL Photo Principale (HTTPS) *</label>
                <input
                  type="text"
                  required
                  value={itemForm.mainPhoto}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, mainPhoto: e.target.value }))}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description Synthétique</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brève synthèse pour le cours..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Récit Historique / Biographie Complète</label>
                <textarea
                  rows={4}
                  value={itemForm.biography}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, biography: e.target.value }))}
                  placeholder="Développement détaillé..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Enregistrer & Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PEDAGOGICAL PATH MODAL (TEACHER) */}
      {newPathModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Nouveau Parcours Pédagogique</span>
              </h3>
              <button onClick={() => setNewPathModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePathSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Titre du Parcours *</label>
                <input
                  type="text"
                  required
                  value={pathForm.title}
                  onChange={(e) => setPathForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Le Rôle du Sankuru dans l'Indépendance"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Classe Cible *</label>
                <select
                  value={pathForm.targetClass}
                  onChange={(e) => setPathForm((prev) => ({ ...prev, targetClass: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="6ème Humanités">6ème Humanités</option>
                  <option value="5ème Humanités">5ème Humanités</option>
                  <option value="4ème Humanités">4ème Humanités</option>
                  <option value="8ème Éducation de Base">8ème Éducation de Base</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sélectionner les Fiches *</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                  {items.map((it) => {
                    const isChecked = pathForm.selectedItemIds.includes(it.id);
                    return (
                      <label key={it.id} className="flex items-center space-x-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPathForm((prev) => ({ ...prev, selectedItemIds: [...prev.selectedItemIds, it.id] }));
                            } else {
                              setPathForm((prev) => ({ ...prev, selectedItemIds: prev.selectedItemIds.filter((id) => id !== it.id) }));
                            }
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-bold">{it.title} ({it.category})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Consignes & Orientations pour la classe</label>
                <textarea
                  rows={2}
                  value={pathForm.comments}
                  onChange={(e) => setPathForm((prev) => ({ ...prev, comments: e.target.value }))}
                  placeholder="Expliquez l'objectif de la recherche aux élèves..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewPathModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Publier Parcours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ MODAL */}
      {activeQuizPath && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600">Évaluation Interactive</span>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">{activeQuizPath.title}</h3>
              </div>
              <button onClick={() => setActiveQuizPath(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {activeQuizPath.quiz.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border space-y-3">
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white">
                    Q{qIdx + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                          className={`w-full p-2.5 rounded-xl text-xs text-left font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-500"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {quizSubmitted && quizScore !== null && (
                <div className="p-4 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-2xl text-center space-y-1">
                  <p className="font-black text-lg">Votre Résultat : {quizScore} / 100</p>
                  <p className="text-xs">
                    {quizScore >= 70 ? "Bravo ! Vous maîtrisez l'histoire du patrimoine congolais." : "Relisez attentivement la fiche avant de recontacter votre enseignant."}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Valider mes Réponses
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveQuizPath(null)}
                    className="px-6 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Fermer l'Évaluation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
