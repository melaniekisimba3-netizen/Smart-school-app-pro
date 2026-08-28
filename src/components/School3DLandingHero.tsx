import React, { useState, useEffect, useRef, memo } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Sparkles, 
  Sun, 
  Sunset, 
  Moon, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  BookOpen,
  Wifi,
  Award
} from "lucide-react";

interface School3DLandingHeroProps {
  schoolName?: string;
  className?: string;
}

export const School3DLandingHero: React.FC<School3DLandingHeroProps> = memo(({
  schoolName = "Complexe Scolaire Moderne",
  className = ""
}) => {
  const [ambientMode, setAmbientMode] = useState<"day" | "sunset" | "night">("day");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax on mouse move
  const handleMouseMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
  };

  const handlePointerLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const ambientThemes = {
    day: {
      skyGradient: "from-sky-400 via-blue-200 to-amber-50",
      buildingWall: "#f8fafc",
      buildingAccent: "#2563eb",
      glassHue: "rgba(59, 130, 246, 0.25)",
      sunGlow: "bg-amber-300 shadow-[0_0_80px_rgba(251,191,36,0.6)]",
      sunPos: "top-4 right-12",
      lightColor: "text-amber-500",
      ambientLabel: "Journée Ensoleillée"
    },
    sunset: {
      skyGradient: "from-amber-600 via-rose-500 to-indigo-950",
      buildingWall: "#fed7aa",
      buildingAccent: "#c2410c",
      glassHue: "rgba(249, 115, 22, 0.35)",
      sunGlow: "bg-orange-500 shadow-[0_0_100px_rgba(249,115,22,0.8)]",
      sunPos: "bottom-24 right-20",
      lightColor: "text-orange-400",
      ambientLabel: "Coucher de Soleil"
    },
    night: {
      skyGradient: "from-slate-950 via-indigo-950 to-slate-900",
      buildingWall: "#1e293b",
      buildingAccent: "#4f46e5",
      glassHue: "rgba(234, 179, 8, 0.45)", // warm interior lights
      sunGlow: "bg-indigo-200 shadow-[0_0_60px_rgba(199,210,254,0.4)]",
      sunPos: "top-6 right-16",
      lightColor: "text-indigo-300",
      ambientLabel: "Études du Soir"
    }
  };

  const curTheme = ambientThemes[ambientMode];

  return (
    <div
      ref={containerRef}
      onPointerMove={handleMouseMove}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800 transition-all select-none ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* 3D TRANSFORM WRAPPER */}
      <div
        className="relative w-full min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex flex-col justify-between transition-transform duration-300 ease-out"
        style={{
          transform: `rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 6}deg)`,
          transformStyle: "preserve-3d"
        }}
      >
        {/* SKY BACKGROUND & AMBIENT ATMOSPHERE */}
        <div className={`absolute inset-0 bg-gradient-to-b ${curTheme.skyGradient} transition-all duration-700`}>
          {/* Sun / Moon Orb */}
          <div className={`absolute ${curTheme.sunPos} w-16 h-16 sm:w-24 sm:h-24 rounded-full ${curTheme.sunGlow} transition-all duration-700 pointer-events-none opacity-90`} />

          {/* Floating Atmospheric Cloud Layers */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent"
            style={{ transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * -8}px, 0)` }}
          />

          {/* Subtle Dynamic Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-white/60 animate-ping"
                style={{
                  top: `${15 + (i * 14)}%`,
                  left: `${10 + (i * 16)}%`,
                  animationDuration: `${3 + i}s`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* TOP BAR OVERLAY: AMBIENT MODE SWITCHER & CAMPUS BADGES */}
        <div 
          className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-2"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 dark:border-slate-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Campus Virtuel 3D HD
            </span>
          </div>

          {/* Lighting Mode Selector */}
          <div className="flex items-center gap-1 bg-black/20 dark:bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20">
            <button
              type="button"
              onClick={() => setAmbientMode("day")}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                ambientMode === "day" ? "bg-amber-400 text-slate-900 shadow-sm" : "text-white/80 hover:text-white"
              }`}
              title="Mode Journée"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setAmbientMode("sunset")}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                ambientMode === "sunset" ? "bg-orange-500 text-white shadow-sm" : "text-white/80 hover:text-white"
              }`}
              title="Mode Crépuscule"
            >
              <Sunset className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setAmbientMode("night")}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                ambientMode === "night" ? "bg-indigo-600 text-white shadow-sm" : "text-white/80 hover:text-white"
              }`}
              title="Mode Nuit & Études"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 3D SCENE: MODERN ARCHITECTURAL SCHOOL & STUDENTS */}
        <div 
          className="relative flex-1 w-full flex items-end justify-center pointer-events-none"
          style={{ transform: "translateZ(50px)" }}
        >
          <svg
            viewBox="0 0 900 480"
            className="w-full h-auto max-h-[380px] drop-shadow-2xl"
            preserveAspectRatio="xMidYBottom meet"
          >
            <defs>
              {/* Architectural Linear Gradients */}
              <linearGradient id="wall3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>

              <linearGradient id="glass3DGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.85" />
              </linearGradient>

              <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>

              <linearGradient id="lawnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="40%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>

              <linearGradient id="pavementGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>

              {/* Congolese Student Skin Tones */}
              <linearGradient id="skinToneBoy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5c3821" />
                <stop offset="100%" stopColor="#3d2111" />
              </linearGradient>
              <linearGradient id="skinToneGirl" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6d4327" />
                <stop offset="100%" stopColor="#452713" />
              </linearGradient>

              {/* Uniform Gradients (Official Congolese Blue & Crisp White) */}
              <linearGradient id="uniformBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="uniformWhite" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>

            {/* BACKGROUND LANDSCAPING & CAMPUS TREES */}
            <g id="campus-landscape">
              {/* Distant Hills / Horizon */}
              <path d="M 0 320 Q 220 280 450 310 T 900 300 L 900 480 L 0 480 Z" fill="#15803d" opacity="0.4" />
              <path d="M 0 340 Q 260 305 520 335 T 900 330 L 900 480 L 0 480 Z" fill="#166534" opacity="0.6" />

              {/* Lush Palm & Acacia Trees */}
              <g transform="translate(40, 240)">
                <rect x="25" y="60" width="12" height="70" rx="3" fill="#78350f" />
                <circle cx="31" cy="45" r="42" fill="#15803d" />
                <circle cx="48" cy="30" r="32" fill="#16a34a" />
                <circle cx="15" cy="35" r="30" fill="#22c55e" />
              </g>

              <g transform="translate(770, 230)">
                <rect x="28" y="70" width="14" height="80" rx="3" fill="#78350f" />
                <circle cx="35" cy="50" r="48" fill="#15803d" />
                <circle cx="55" cy="35" r="36" fill="#16a34a" />
                <circle cx="12" cy="40" r="34" fill="#22c55e" />
              </g>
            </g>

            {/* MAIN 3D ARCHITECTURAL SCHOOL COMPLEX */}
            <g id="school-building-complex">
              {/* Building Shadow */}
              <ellipse cx="450" cy="425" rx="360" ry="25" fill="#000000" opacity="0.25" />

              {/* West Wing (Left) */}
              <g transform="translate(150, 180)">
                <polygon points="0,50 140,20 140,230 0,230" fill="#cbd5e1" />
                {/* Modern Windows */}
                {[0, 1, 2].map((row) => (
                  <g key={row} transform={`translate(20, ${50 + row * 55})`}>
                    <polygon points="0,5 95,-15 95,25 0,40" fill="url(#glass3DGrad)" stroke="#334155" strokeWidth="2" />
                  </g>
                ))}
              </g>

              {/* East Wing (Right) */}
              <g transform="translate(610, 180)">
                <polygon points="0,20 140,50 140,230 0,230" fill="#94a3b8" />
                {[0, 1, 2].map((row) => (
                  <g key={row} transform={`translate(25, ${40 + row * 55})`}>
                    <polygon points="0,-15 95,5 95,40 0,25" fill="url(#glass3DGrad)" stroke="#334155" strokeWidth="2" />
                  </g>
                ))}
              </g>

              {/* Central Main Modern Atrium / Entrance Pavillion */}
              <g id="central-pavillion">
                {/* Main Wall */}
                <rect x="280" y="140" width="340" height="270" rx="6" fill="#f8fafc" stroke="#64748b" strokeWidth="3" />

                {/* Upper Arch / Fronton with Pediment */}
                <polygon points="260,140 450,85 640,140" fill="url(#roofGrad)" stroke="#1e3a8a" strokeWidth="3" />
                <polygon points="275,138 450,95 625,138" fill="#172554" />

                {/* Clock / SmartSchool Emblem in Pediment */}
                <circle cx="450" cy="120" r="16" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <circle cx="450" cy="120" r="13" fill="#1e3a8a" />
                <line x1="450" y1="120" x2="450" y2="112" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="450" y1="120" x2="457" y2="120" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

                {/* DRC Flagpole on Top of School */}
                <g transform="translate(450, 45)">
                  <line x1="0" y1="40" x2="0" y2="-15" stroke="#94a3b8" strokeWidth="3" />
                  <circle cx="0" cy="-15" r="3" fill="#f59e0b" />
                  {/* DRC Flag Flying */}
                  <g transform="translate(0, -14)">
                    <rect x="0" y="0" width="32" height="20" fill="#007fff" rx="1" />
                    <polygon points="0,20 32,0 32,4 0,24" fill="#ce1021" />
                    <polygon points="0,17 32,-3 32,0 0,20" fill="#f7d618" />
                    <polygon points="0,23 32,3 32,6 0,26" fill="#f7d618" />
                    {/* Yellow Star */}
                    <circle cx="6" cy="6" r="3.5" fill="#f7d618" />
                  </g>
                </g>

                {/* Upper Floor Glass Bay Windows */}
                <g transform="translate(305, 160)">
                  <rect x="0" y="0" width="290" height="90" rx="4" fill="url(#glass3DGrad)" stroke="#1e293b" strokeWidth="3" />
                  <line x1="96" y1="0" x2="96" y2="90" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                  <line x1="193" y1="0" x2="193" y2="90" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                  <line x1="0" y1="45" x2="290" y2="45" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
                </g>

                {/* Architectural Columns */}
                <rect x="315" y="260" width="24" height="150" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" rx="2" />
                <rect x="560" y="260" width="24" height="150" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" rx="2" />

                {/* Main Entrance Grand Portal */}
                <g transform="translate(365, 275)">
                  {/* Door Frame Arch */}
                  <rect x="0" y="0" width="170" height="135" rx="12" fill="#0f172a" stroke="#d97706" strokeWidth="3" />
                  {/* Left Glass Door */}
                  <rect x="6" y="8" width="75" height="122" rx="6" fill="url(#glass3DGrad)" stroke="#cbd5e1" strokeWidth="2" />
                  {/* Right Glass Door */}
                  <rect x="88" y="8" width="75" height="122" rx="6" fill="url(#glass3DGrad)" stroke="#cbd5e1" strokeWidth="2" />
                  {/* Door Handles in Brass Gold */}
                  <rect x="70" y="65" width="4" height="24" rx="2" fill="#f59e0b" />
                  <rect x="94" y="65" width="4" height="24" rx="2" fill="#f59e0b" />
                </g>

                {/* Entrance Steps / Parvis */}
                <polygon points="260,410 640,410 690,440 210,440" fill="url(#pavementGrad)" stroke="#64748b" strokeWidth="2" />
                <polygon points="230,440 670,440 720,465 180,465" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
              </g>
            </g>

            {/* FOREGROUND: CAMPUS LAWN & STUDENTS IN UNIFORM */}
            <g id="foreground-campus">
              {/* Grand Front Courtyard Lawn */}
              <path d="M 0 440 Q 450 420 900 440 L 900 480 L 0 480 Z" fill="url(#lawnGrad)" />

              {/* Student 1 (Boy in Uniform on Left - Greeting with hand wave) */}
              <g transform="translate(240, 310)">
                {/* Shadow */}
                <ellipse cx="40" cy="160" rx="30" ry="8" fill="#000000" opacity="0.3" />

                {/* Legs & Navy Trousers */}
                <path d="M 28 100 L 25 155 L 36 155 L 38 100 Z" fill="url(#uniformBlue)" />
                <path d="M 42 100 L 44 155 L 55 155 L 52 100 Z" fill="url(#uniformBlue)" />
                {/* Black School Shoes */}
                <rect x="20" y="152" width="18" height="10" rx="4" fill="#0f172a" />
                <rect x="42" y="152" width="18" height="10" rx="4" fill="#0f172a" />

                {/* Crisp White Shirt with Royal Blue Collar & Tie */}
                <rect x="25" y="48" width="32" height="55" rx="5" fill="url(#uniformWhite)" stroke="#cbd5e1" strokeWidth="1" />
                {/* Navy Blue School Vest */}
                <path d="M 25 52 L 35 78 L 47 78 L 57 52 L 57 98 L 25 98 Z" fill="url(#uniformBlue)" />
                {/* Gold School Crest on Chest */}
                <circle cx="32" cy="65" r="3.5" fill="#f59e0b" />

                {/* Backpack Strap */}
                <rect x="24" y="52" width="4" height="40" rx="2" fill="#b45309" />

                {/* Left Arm carrying School Binder */}
                <path d="M 25 55 L 14 90 L 22 95 L 30 65 Z" fill="url(#uniformWhite)" />
                <rect x="10" y="85" width="15" height="22" rx="3" fill="#2563eb" transform="rotate(-10 10 85)" />

                {/* Right Arm: Friendly Welcoming Wave */}
                <g className="origin-bottom-left animate-pulse">
                  <path d="M 55 55 L 75 35 L 82 42 L 58 68 Z" fill="url(#uniformWhite)" />
                  {/* Hand waving */}
                  <circle cx="78" cy="32" r="6" fill="url(#skinToneBoy)" />
                </g>

                {/* Head & Natural Expression */}
                <circle cx="41" cy="28" r="16" fill="url(#skinToneBoy)" />
                {/* Hair */}
                <path d="M 27 22 Q 41 10 55 22 Q 57 14 41 12 Q 25 14 27 22 Z" fill="#0f172a" />
                {/* Eyes & Smile */}
                <circle cx="37" cy="26" r="2" fill="#0f172a" />
                <circle cx="47" cy="26" r="2" fill="#0f172a" />
                <path d="M 38 33 Q 42 38 46 33" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>

              {/* Student 2 (Girl in Uniform on Right - Holding Digital Tablet) */}
              <g transform="translate(620, 310)">
                {/* Shadow */}
                <ellipse cx="40" cy="160" rx="30" ry="8" fill="#000000" opacity="0.3" />

                {/* Legs & School Socks */}
                <rect x="28" y="115" width="8" height="38" rx="3" fill="url(#skinToneGirl)" />
                <rect x="44" y="115" width="8" height="38" rx="3" fill="url(#skinToneGirl)" />
                {/* White Socks & Black Shoes */}
                <rect x="27" y="145" width="10" height="8" rx="2" fill="#ffffff" />
                <rect x="43" y="145" width="10" height="8" rx="2" fill="#ffffff" />
                <rect x="24" y="152" width="16" height="10" rx="4" fill="#0f172a" />
                <rect x="43" y="152" width="16" height="10" rx="4" fill="#0f172a" />

                {/* Navy Pleated Skirt */}
                <polygon points="22,88 58,88 64,120 16,120" fill="url(#uniformBlue)" stroke="#0f172a" strokeWidth="1" />

                {/* Crisp White Blouse with Blue Tie */}
                <rect x="25" y="48" width="30" height="42" rx="5" fill="url(#uniformWhite)" />
                <polygon points="38,55 42,55 45,75 35,75" fill="url(#uniformBlue)" />
                {/* School Crest */}
                <circle cx="31" cy="62" r="3" fill="#f59e0b" />

                {/* Digital Learning Tablet in Hands */}
                <rect x="22" y="70" width="36" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x="25" y="73" width="30" height="18" rx="2" fill="#38bdf8" opacity="0.85" />
                {/* Screen Glow */}
                <line x1="28" y1="78" x2="45" y2="78" stroke="#ffffff" strokeWidth="2" />
                <line x1="28" y1="83" x2="50" y2="83" stroke="#ffffff" strokeWidth="1.5" />

                {/* Head & Natural Braids */}
                <circle cx="40" cy="27" r="15" fill="url(#skinToneGirl)" />
                {/* Braided Hair */}
                <path d="M 26 24 Q 40 10 54 24 Q 56 12 40 10 Q 24 12 26 24 Z" fill="#0f172a" />
                <circle cx="25" cy="28" r="4" fill="#0f172a" />
                <circle cx="55" cy="28" r="4" fill="#0f172a" />
                {/* Eyes & Smile */}
                <circle cx="36" cy="25" r="2" fill="#0f172a" />
                <circle cx="44" cy="25" r="2" fill="#0f172a" />
                <path d="M 37 32 Q 40 36 43 32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            </g>
          </svg>
        </div>

        {/* BOTTOM FLOATING BRAND RIBBON */}
        <div 
          className="relative z-20 p-4 sm:p-5 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/40 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                Plateforme Éducative d'Excellence RDC
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% Conforme au Ministère de l'Éducation Nationale et Nouvelle Citoyenneté (EPST)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800">
              <Wifi className="h-3 w-3 text-emerald-600" />
              Mode Connecté & Hors-Ligne
            </span>
          </div>
        </div>

      </div>
    </div>
  );
});
