import React, { useEffect, useState, useRef, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  UserCheck, 
  School,
  GraduationCap
} from "lucide-react";

interface SchoolWelcome3DAnimationProps {
  schoolName: string;
  userName: string;
  userRole: string;
  schoolLogoUrl?: string;
  onComplete: () => void;
  autoPlayAudio?: boolean;
}

export const SchoolWelcome3DAnimation: React.FC<SchoolWelcome3DAnimationProps> = memo(({
  schoolName,
  userName,
  userRole,
  schoolLogoUrl,
  onComplete,
  autoPlayAudio = true
}) => {
  // Animation stage:
  // 1: Initial scene - Student stands in front of the school with dynamic name
  // 2: Student walks forward towards entrance & opens doors (3D door swing)
  // 3: Doors open wide, interior light shines, student says "Bienvenue !"
  // 4: Final transition & fade-through to dashboard
  const [stage, setStage] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speechSpoken, setSpeechSpoken] = useState<boolean>(false);
  const hasTriggeredCompleteRef = useRef<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play pleasant crystal school bell / welcome chime via Web Audio API
  const playWelcomeChime = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Play a warm 3-note harmonic arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.14);

        gain.gain.setValueAtTime(0.001, now + index * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.14 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.14 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.14);
        osc.stop(now + index * 0.14 + 1.25);
      });
    } catch {
      // Audio fallback without interrupting user flow
    }
  };

  // Vocal speech synthesis: "Bienvenue"
  const speakWelcome = () => {
    if (isMuted || speechSpoken) return;
    setSpeechSpoken(true);

    try {
      if ("speechSynthesis" in window) {
        // Cancel any pending speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance("Bienvenue !");
        utterance.lang = "fr-FR";
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        // Try to pick a natural French voice if available
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(v => v.lang.startsWith("fr") || v.lang.includes("fr-FR"));
        if (frenchVoice) {
          utterance.voice = frenchVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Voice fallback handled gracefully
    }
  };

  // Orchestrate animation timeline
  useEffect(() => {
    // Stage 1 -> Stage 2 after 700ms (student steps forward and reaches doors)
    const t1 = setTimeout(() => {
      setStage(2);
      playWelcomeChime();
    }, 700);

    // Stage 2 -> Stage 3 after 1800ms (doors open, student greets "Bienvenue")
    const t2 = setTimeout(() => {
      setStage(3);
      speakWelcome();
    }, 1800);

    // Stage 3 -> Stage 4 after 3400ms (fade out to portal)
    const t3 = setTimeout(() => {
      setStage(4);
    }, 3400);

    // Complete transition to dashboard
    const t4 = setTimeout(() => {
      if (!hasTriggeredCompleteRef.current) {
        hasTriggeredCompleteRef.current = true;
        onComplete();
      }
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleSkip = () => {
    if (!hasTriggeredCompleteRef.current) {
      hasTriggeredCompleteRef.current = true;
      try {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}
      onComplete();
    }
  };

  // Format clean school name
  const displaySchoolName = schoolName?.trim() || "Établissement Scolaire RDC";

  return (
    <div 
      id="school-welcome-3d-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl overflow-hidden select-none"
    >
      {/* BACKGROUND VOLUMETRIC LIGHT & PARTICLES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dynamic Sun Ray from Above */}
        <div 
          className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-amber-400/20 via-blue-500/10 to-transparent blur-3xl transition-opacity duration-1000 ${
            stage >= 3 ? "opacity-100 scale-110" : "opacity-60 scale-100"
          }`} 
        />

        {/* Ambient Glow behind the school */}
        <div className="absolute inset-0 bg-radial from-blue-900/30 via-slate-950/80 to-slate-950 pointer-events-none" />
      </div>

      {/* TOP FLOATING CONTROLS */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 text-white shadow-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Connexion Réussie
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-semibold text-slate-300">
            {userRole}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-lg"
            title={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>

          {/* Quick Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-black rounded-full border border-white/30 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg group"
          >
            <span>Accéder au portail</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 3D SCENE CONTAINER */}
      <div 
        className="relative w-full max-w-4xl px-4 flex flex-col items-center justify-center min-h-[520px]"
        style={{ perspective: 1200 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotateX: 6 }}
          animate={{ 
            opacity: stage === 4 ? 0 : 1, 
            scale: stage === 4 ? 1.08 : 1,
            rotateX: 0,
            y: stage === 4 ? -20 : 0
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full flex flex-col items-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* 3D SCHOOL BUILDING WITH DYNAMIC NAME */}
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
            
            {/* Architectural Pediment Header */}
            <div className="text-center relative pb-6 border-b border-amber-500/20">
              
              {/* DRC Flag & Emblems */}
              <div className="flex items-center justify-center gap-3 mb-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/48px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png"
                  alt="Drapeau RDC"
                  className="h-4 w-6 object-cover rounded shadow-sm"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  République Démocratique du Congo • EPST
                </span>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/48px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png"
                  alt="Drapeau RDC"
                  className="h-4 w-6 object-cover rounded shadow-sm"
                />
              </div>

              {/* DYNAMIC REAL SCHOOL NAME ENGRAVED ON THE FAÇADE */}
              <div className="relative inline-block px-4 py-2 mt-1">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/25 to-amber-500/10 rounded-2xl border border-amber-400/40 blur-xs" />
                <h1 className="relative text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-tight uppercase drop-shadow-md text-center">
                  {displaySchoolName}
                </h1>
              </div>

              <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center justify-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
                <span>Portail Pédagogique & Administratif Connecté</span>
              </p>
            </div>

            {/* 3D INTERACTIVE DOORWAY & ANIMATED STUDENT SCENE */}
            <div className="relative w-full h-[260px] sm:h-[300px] flex items-end justify-center mt-4">
              
              {/* Grand Entrance Doorway Frame */}
              <div className="relative w-[180px] sm:w-[220px] h-[220px] sm:h-[250px] bg-slate-950 rounded-t-full border-4 border-amber-500/60 overflow-hidden shadow-2xl flex items-center justify-center">
                
                {/* Lobby Interior Light (shines when doors open) */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-300 transition-opacity duration-1000 flex flex-col items-center justify-center p-4 ${
                    stage >= 2 ? "opacity-100" : "opacity-10"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-amber-400/40 blur-md animate-pulse" />
                  <div className="text-center mt-2">
                    <span className="text-[9px] font-black uppercase text-amber-900 tracking-widest block">
                      Hall Principal
                    </span>
                    <span className="text-[8px] font-bold text-amber-800">
                      Bienvenue au campus
                    </span>
                  </div>
                </div>

                {/* Left Door (Opens in 3D Perspective) */}
                <div
                  className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-r border-amber-500/40 shadow-2xl origin-left transition-transform duration-1000 ease-out"
                  style={{
                    transform: stage >= 2 ? "rotateY(-85deg)" : "rotateY(0deg)",
                    transformStyle: "preserve-3d"
                  }}
                >
                  {/* Glass panel */}
                  <div className="m-2 h-[85%] rounded-t-full border border-blue-400/30 bg-blue-500/10 flex items-center justify-end pr-1">
                    <div className="w-1.5 h-8 bg-amber-400 rounded-full shadow-md" />
                  </div>
                </div>

                {/* Right Door (Opens in 3D Perspective) */}
                <div
                  className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 border-l border-amber-500/40 shadow-2xl origin-right transition-transform duration-1000 ease-out"
                  style={{
                    transform: stage >= 2 ? "rotateY(85deg)" : "rotateY(0deg)",
                    transformStyle: "preserve-3d"
                  }}
                >
                  {/* Glass panel */}
                  <div className="m-2 h-[85%] rounded-t-full border border-blue-400/30 bg-blue-500/10 flex items-center justify-start pl-1">
                    <div className="w-1.5 h-8 bg-amber-400 rounded-full shadow-md" />
                  </div>
                </div>

              </div>

              {/* 3D CONGOLESE STUDENT IN UNIFORM (Approaching & Welcoming) */}
              <motion.div
                initial={{ y: 20, scale: 0.85 }}
                animate={{
                  y: stage >= 2 ? -10 : 15,
                  scale: stage >= 2 ? 1.08 : 0.88,
                  x: stage >= 2 ? -25 : 0
                }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="absolute z-20 flex flex-col items-center"
              >
                {/* SPEECH BUBBLE: "Bienvenue !" */}
                <AnimatePresence>
                  {stage >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className="absolute -top-16 -right-20 sm:-right-24 z-30 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-xl border-2 border-white flex items-center gap-1.5 animate-bounce"
                    >
                      <Sparkles className="h-4 w-4 text-amber-900 fill-amber-900" />
                      <span>« Bienvenue ! »</span>
                      <div className="absolute -bottom-2 left-6 w-3 h-3 bg-amber-400 rotate-45 border-r-2 border-b-2 border-white" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SVG Character of Congolese Student in Uniform */}
                <svg
                  viewBox="0 0 160 220"
                  className="w-32 sm:w-40 h-auto drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]"
                >
                  <defs>
                    <linearGradient id="charSkinTone" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#63391d" />
                      <stop offset="100%" stopColor="#3d2010" />
                    </linearGradient>
                    <linearGradient id="charBlazer" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e3a8a" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                  </defs>

                  {/* Character Shadow */}
                  <ellipse cx="80" cy="210" rx="35" ry="7" fill="#000000" opacity="0.5" />

                  {/* Legs in Navy Trousers */}
                  <path d="M 65 130 L 62 205 L 75 205 L 77 130 Z" fill="url(#charBlazer)" />
                  <path d="M 83 130 L 85 205 L 98 205 L 95 130 Z" fill="url(#charBlazer)" />
                  {/* Black School Shoes */}
                  <rect x="56" y="202" width="22" height="12" rx="4" fill="#020617" />
                  <rect x="83" y="202" width="22" height="12" rx="4" fill="#020617" />

                  {/* School Uniform Blazer & Crisp White Shirt */}
                  {/* White Shirt base */}
                  <polygon points="60,65 100,65 102,132 58,132" fill="#ffffff" />
                  {/* Royal Blue School Tie */}
                  <polygon points="76,68 84,68 87,110 80,120 73,110" fill="#1d4ed8" />

                  {/* Navy Blue School Blazer */}
                  <path d="M 58 65 L 72 105 L 80 132 L 60 132 Z" fill="url(#charBlazer)" />
                  <path d="M 102 65 L 88 105 L 80 132 L 100 132 Z" fill="url(#charBlazer)" />
                  {/* Gold School Crest Badge on Left Chest */}
                  <circle cx="68" cy="85" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />

                  {/* Left Arm: Opening the Door */}
                  <g className={stage >= 2 ? "origin-top-left rotate-12 transition-transform" : ""}>
                    <path d="M 58 68 L 36 95 L 45 102 L 66 75 Z" fill="url(#charBlazer)" />
                    {/* Hand touching the door handle */}
                    <circle cx="34" cy="98" r="7" fill="url(#charSkinTone)" />
                  </g>

                  {/* Right Arm: Welcoming Hand Wave */}
                  <g className={stage >= 2 ? "origin-top-right -rotate-25 transition-transform" : ""}>
                    <path d="M 102 68 L 126 50 L 134 58 L 108 78 Z" fill="url(#charBlazer)" />
                    {/* Welcoming Hand */}
                    <circle cx="132" cy="48" r="7" fill="url(#charSkinTone)" />
                  </g>

                  {/* Head, Warm Smile & Smart School Hairstyle */}
                  <circle cx="80" cy="38" r="22" fill="url(#charSkinTone)" />
                  {/* Neat Hair */}
                  <path d="M 60 32 Q 80 14 100 32 Q 102 18 80 15 Q 58 18 60 32 Z" fill="#020617" />
                  {/* Expressive Friendly Eyes */}
                  <circle cx="73" cy="35" r="2.5" fill="#020617" />
                  <circle cx="87" cy="35" r="2.5" fill="#020617" />
                  <circle cx="74" cy="34" r="0.8" fill="#ffffff" />
                  <circle cx="88" cy="34" r="0.8" fill="#ffffff" />
                  {/* Bright Welcoming Smile */}
                  <path d="M 72 45 Q 80 54 88 45" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </motion.div>

            </div>

            {/* LOWER WELCOME BANNER WITH USER & ESTABLISHMENT IDENTITY */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-300">Session ouverte pour :</span>
                <strong className="text-white font-extrabold">{userName}</strong>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">{userRole}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Redirection automatique vers votre espace de travail sécurisé...
              </p>
            </div>

          </div>
        </motion.div>
      </div>

    </div>
  );
});
