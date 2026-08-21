import React, { memo } from "react";
import { Sparkles, BookOpen, GraduationCap, Award } from "lucide-react";

interface CongoleseStudentsStudyAnimationProps {
  className?: string;
  isCompact?: boolean;
}

export const CongoleseStudentsStudyAnimation: React.FC<CongoleseStudentsStudyAnimationProps> = memo(({
  className = "",
  isCompact = false
}) => {
  return (
    <div
      id="congolese-students-study-animation"
      className={`relative w-full overflow-hidden rounded-2xl border border-indigo-100/80 dark:border-indigo-900/40 bg-gradient-to-b from-indigo-50/70 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40 shadow-sm transition-all duration-300 ${
        isCompact ? "h-28 sm:h-32" : "h-36 sm:h-44 md:h-48"
      } ${className}`}
    >
      <style>{`
        @keyframes ssBreathe {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(0.4deg); }
        }
        @keyframes ssBreatheAlt {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2.8px) rotate(-0.5deg); }
        }
        @keyframes ssWriteMotion {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(2.5px, 1px) rotate(-1.5deg); }
          50% { transform: translate(4px, -0.5px) rotate(1deg); }
          75% { transform: translate(1.5px, 1.5px) rotate(-0.5deg); }
        }
        @keyframes ssPageFlutter {
          0%, 100% { transform: scaleX(1) skewY(0deg); }
          50% { transform: scaleX(0.92) skewY(-1.8deg); }
        }
        @keyframes ssHeadNod {
          0%, 100% { transform: rotate(0deg); }
          35% { transform: rotate(1.2deg); }
          70% { transform: rotate(-0.8deg); }
        }
        @keyframes ssSparkleFloat {
          0% { transform: translateY(0px) scale(0.7); opacity: 0.2; }
          50% { transform: translateY(-9px) scale(1.1); opacity: 0.9; }
          100% { transform: translateY(-18px) scale(0.6); opacity: 0; }
        }
        @keyframes ssScreenPulse {
          0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.4)); }
          50% { opacity: 1; filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.7)); }
        }
        @keyframes ssChalkGlow {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 0.95; }
        }
        .anim-breathe-1 { animation: ssBreathe 4.2s ease-in-out infinite; transform-origin: center bottom; }
        .anim-breathe-2 { animation: ssBreatheAlt 4.8s ease-in-out infinite 0.6s; transform-origin: center bottom; }
        .anim-breathe-3 { animation: ssBreathe 5.2s ease-in-out infinite 1.2s; transform-origin: center bottom; }
        .anim-write { animation: ssWriteMotion 1.8s ease-in-out infinite; transform-origin: 220px 145px; }
        .anim-page { animation: ssPageFlutter 3.2s ease-in-out infinite; transform-origin: 300px 140px; }
        .anim-head { animation: ssHeadNod 6s ease-in-out infinite; transform-origin: 295px 65px; }
        .anim-float-p1 { animation: ssSparkleFloat 3.8s ease-in-out infinite; }
        .anim-float-p2 { animation: ssSparkleFloat 4.4s ease-in-out infinite 1.4s; }
        .anim-float-p3 { animation: ssSparkleFloat 3.2s ease-in-out infinite 0.7s; }
        .anim-screen { animation: ssScreenPulse 3s ease-in-out infinite; }
        .anim-chalk { animation: ssChalkGlow 5s ease-in-out infinite; }
      `}</style>

      {/* BACKGROUND SCENERY: Modern Congolese Classroom / Digital Learning Studio */}
      <svg
        viewBox="0 0 600 200"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full object-cover select-none pointer-events-none"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eef2ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f8fafc" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
          
          <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="deskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Skin Tones for Congolese Students (Warm, natural, refined tones) */}
          <linearGradient id="skinGirlLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#693b1d" />
            <stop offset="100%" stopColor="#4e2912" />
          </linearGradient>

          <linearGradient id="skinBoyCenter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7a4622" />
            <stop offset="100%" stopColor="#542c13" />
          </linearGradient>

          <linearGradient id="skinGirlRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#874f28" />
            <stop offset="100%" stopColor="#5e3417" />
          </linearGradient>

          {/* Congolese School Uniform Gradients (Iconic Bleu-Blanc & Modern Scholastic Navy) */}
          <linearGradient id="uniformBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="uniformNavy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="uniformYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="bookAmber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="bookIndigo" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>

          <linearGradient id="bookEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* RDC Flag Ribbon Subtle Accent */}
          <linearGradient id="rdcFlag" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#007fff" />
            <stop offset="45%" stopColor="#fcd116" />
            <stop offset="55%" stopColor="#ce1126" />
            <stop offset="100%" stopColor="#007fff" />
          </linearGradient>

          {/* Soft Glow filter */}
          <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. BACKGROUND WALL & CLASSROOM BOARD */}
        <rect x="0" y="0" width="600" height="200" fill="url(#bgGrad)" className="dark:opacity-0" />
        
        {/* Stylized Modern Interactive Board in Background */}
        <g className="anim-chalk" opacity="0.9">
          <rect
            x="70"
            y="12"
            width="460"
            height="100"
            rx="12"
            fill="url(#boardGrad)"
            stroke="#334155"
            strokeWidth="2"
            className="dark:stroke-indigo-800"
          />
          {/* Inner Board Frame */}
          <rect
            x="76"
            y="18"
            width="448"
            height="88"
            rx="8"
            fill="#0f172a"
            opacity="0.95"
          />

          {/* Subtle Educational Formulas and Motifs */}
          <path
            d="M 95 38 Q 120 28 145 38 T 195 38"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.5"
          />
          <text x="96" y="55" fill="#94a3b8" fontSize="9" fontFamily="system-ui" fontWeight="600" opacity="0.75">
            E = mc² • ∑(x) = Avenir • RDC
          </text>
          
          {/* Central Scholastic Motto */}
          <text
            x="300"
            y="42"
            fill="#f8fafc"
            fontSize="11"
            fontFamily="system-ui"
            fontWeight="800"
            textAnchor="middle"
            letterSpacing="1.5"
            opacity="0.9"
          >
            EXCELLENCE • SAVOIR • DISCIPLINE
          </text>

          <text
            x="300"
            y="56"
            fill="#38bdf8"
            fontSize="8.5"
            fontFamily="system-ui"
            fontWeight="700"
            textAnchor="middle"
            opacity="0.85"
          >
            Éducation Numérique de Haute Performance
          </text>

          {/* Mini Geometric Diagram on Board */}
          <circle cx="485" cy="45" r="14" fill="none" stroke="#818cf8" strokeWidth="1" opacity="0.6" />
          <polygon points="485,33 496,52 474,52" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
          <text x="485" y="70" fill="#cbd5e1" fontSize="7.5" fontFamily="system-ui" textAnchor="middle" opacity="0.7">
            Sciences & Tech
          </text>
        </g>

        {/* 2. FLOATING KNOWLEDGE SPARKLES & AMBIENT PARTICLES */}
        <g>
          {/* Particle 1: Left floating book icon / sparkle */}
          <g className="anim-float-p1" transform="translate(110, 60)">
            <circle cx="0" cy="0" r="12" fill="#dbeafe" opacity="0.7" className="dark:fill-indigo-950 dark:opacity-0.8" />
            <path d="M -5 -4 L 0 -2 L 5 -4 L 5 4 L 0 6 L -5 4 Z" fill="#2563eb" opacity="0.85" />
          </g>

          {/* Particle 2: Center-Right floating star / atom */}
          <g className="anim-float-p2" transform="translate(430, 48)">
            <circle cx="0" cy="0" r="14" fill="#fef3c7" opacity="0.65" className="dark:fill-amber-950 dark:opacity-0.8" />
            <path d="M 0 -6 L 2 -2 L 6 0 L 2 2 L 0 6 L -2 2 L -6 0 L -2 -2 Z" fill="#d97706" opacity="0.9" />
          </g>

          {/* Particle 3: Gentle RDC badge motif */}
          <g className="anim-float-p3" transform="translate(200, 40)">
            <circle cx="0" cy="0" r="9" fill="#e0e7ff" opacity="0.6" className="dark:fill-slate-800" />
            <polygon points="0,-4 3,3 -3,3" fill="#6366f1" opacity="0.8" />
          </g>
        </g>

        {/* 3. DESK SURFACE & COLLABORATION TABLE */}
        <g>
          {/* Study Desk Base */}
          <path
            d="M 10 160 L 590 160 L 600 200 L 0 200 Z"
            fill="url(#deskGrad)"
            className="dark:fill-slate-900"
          />
          <line
            x1="10"
            y1="160"
            x2="590"
            y2="160"
            stroke="#94a3b8"
            strokeWidth="1.5"
            className="dark:stroke-slate-700"
          />
          {/* Desk Edge Highlight */}
          <line
            x1="0"
            y1="162"
            x2="600"
            y2="162"
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.8"
          />
        </g>

        {/* 4. CONGOLESE STUDENTS CHARACTERS (Modern, Dignified, Stylized) */}

        {/* ========================================================= */}
        {/* CHARACTER 1 (LEFT): Congolese Student (Girl) Writing Notes */}
        {/* ========================================================= */}
        <g className="anim-breathe-1" id="student-girl-left">
          {/* Torso & Uniform (White shirt + Navy blue school blazer / jumper) */}
          <path
            d="M 130 200 L 140 135 Q 165 125 190 128 L 210 145 L 215 200 Z"
            fill="url(#uniformNavy)"
          />
          {/* Crisp White Shirt Collar */}
          <polygon points="162,126 175,142 188,126 175,133" fill="#ffffff" />
          <polygon points="172,133 175,152 178,133" fill="#2563eb" /> {/* School tie / badge */}

          {/* Head & Neck */}
          <rect x="168" y="108" width="14" height="20" rx="4" fill="url(#skinGirlLeft)" />
          
          {/* Hair (Braided High Crown with subtle beads) */}
          <ellipse cx="175" cy="85" rx="22" ry="24" fill="#171717" />
          <circle cx="175" cy="62" r="13" fill="#1c1917" />
          {/* Decorative Hair Beads (Yellow & Cyan accents) */}
          <circle cx="166" cy="62" r="2.2" fill="#fbbf24" />
          <circle cx="184" cy="62" r="2.2" fill="#38bdf8" />
          <circle cx="175" cy="53" r="2.2" fill="#ef4444" />

          {/* Face */}
          <ellipse cx="175" cy="88" rx="16" ry="18" fill="url(#skinGirlLeft)" />
          {/* Ear with small golden earring */}
          <ellipse cx="159" cy="89" rx="3.5" ry="5" fill="#4e2912" />
          <circle cx="158.5" cy="92" r="1.5" fill="#fbbf24" />

          {/* Focused Eyes Looking Down at Notebook */}
          <ellipse cx="170" cy="86" rx="2.5" ry="1.6" fill="#ffffff" />
          <circle cx="171" cy="87" r="1.2" fill="#171717" />
          <ellipse cx="180" cy="86" rx="2.5" ry="1.6" fill="#ffffff" />
          <circle cx="181" cy="87" r="1.2" fill="#171717" />

          {/* Eyebrows */}
          <path d="M 167 82 Q 171 80 174 82" stroke="#171717" strokeWidth="1.2" fill="none" />
          <path d="M 178 82 Q 182 80 185 82" stroke="#171717" strokeWidth="1.2" fill="none" />

          {/* Cheerful focused smile */}
          <path d="M 172 96 Q 176 99 180 96" stroke="#9a3412" strokeWidth="1.4" fill="none" strokeLinecap="round" />

          {/* Arm & Hand Writing */}
          <path
            d="M 185 140 Q 205 155 220 162"
            fill="none"
            stroke="url(#skinGirlLeft)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Animated Pen & Hand Writing Action */}
          <g className="anim-write">
            <ellipse cx="222" cy="162" rx="5" ry="4" fill="url(#skinGirlLeft)" />
            {/* Pen */}
            <line x1="216" y1="152" x2="228" y2="170" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
            <polygon points="228,170 230,172 227,172" fill="#0f172a" />
          </g>

          {/* Open Notebook on Desk with Written Lines */}
          <g className="anim-page">
            <rect x="185" y="155" width="46" height="34" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="208" y1="155" x2="208" y2="189" stroke="#e2e8f0" strokeWidth="1" />
            {/* Ruled lines */}
            <line x1="190" y1="162" x2="204" y2="162" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
            <line x1="190" y1="168" x2="203" y2="168" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
            <line x1="190" y1="174" x2="205" y2="174" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
            <line x1="190" y1="180" x2="200" y2="180" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />

            <line x1="212" y1="162" x2="226" y2="162" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
            <line x1="212" y1="168" x2="225" y2="168" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
            <line x1="212" y1="174" x2="227" y2="174" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* CHARACTER 2 (CENTER): Congolese Student (Boy) Reading Book */}
        {/* ========================================================= */}
        <g className="anim-breathe-2" id="student-boy-center">
          {/* Torso: Iconic Congolese Uniform (Bleu Ciel & Dark Blue Collar) */}
          <path
            d="M 255 200 L 265 130 Q 300 118 335 130 L 345 200 Z"
            fill="url(#uniformBlue)"
          />
          {/* Collar & Tie */}
          <polygon points="290,123 300,138 310,123 300,130" fill="#ffffff" />
          <polygon points="297,130 300,154 303,130" fill="#1e3a8a" />

          {/* Head & Neck (With subtle head nodding animation) */}
          <g className="anim-head">
            <rect x="293" y="103" width="15" height="22" rx="4" fill="url(#skinBoyCenter)" />
            
            {/* Hair: Crisp modern fade */}
            <ellipse cx="300" cy="79" rx="19" ry="21" fill="#171717" />
            <path d="M 281 83 Q 300 68 319 83 Z" fill="#0f172a" />

            {/* Face */}
            <ellipse cx="300" cy="84" rx="16" ry="18" fill="url(#skinBoyCenter)" />
            {/* Ears */}
            <ellipse cx="283" cy="85" rx="3.5" ry="5.5" fill="#542c13" />
            <ellipse cx="317" cy="85" rx="3.5" ry="5.5" fill="#542c13" />

            {/* Concentrated Eyes Looking at Book */}
            <ellipse cx="294" cy="82" rx="2.5" ry="1.6" fill="#ffffff" />
            <circle cx="294" cy="83.5" r="1.2" fill="#171717" />
            <ellipse cx="306" cy="82" rx="2.5" ry="1.6" fill="#ffffff" />
            <circle cx="306" cy="83.5" r="1.2" fill="#171717" />

            {/* Eyebrows */}
            <path d="M 290 77 Q 294 75 298 77" stroke="#171717" strokeWidth="1.3" fill="none" />
            <path d="M 302 77 Q 306 75 310 77" stroke="#171717" strokeWidth="1.3" fill="none" />

            {/* Confident gentle smile */}
            <path d="M 296 93 Q 300 96 304 93" stroke="#78350f" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </g>

          {/* Hardcover Textbook Held in Hands */}
          <g transform="translate(270, 142)">
            {/* Book Cover */}
            <path
              d="M 5 8 Q 30 18 55 8 L 57 36 Q 30 46 3 36 Z"
              fill="url(#bookAmber)"
            />
            {/* Book Pages */}
            <path
              d="M 7 6 Q 30 15 53 6 L 53 32 Q 30 42 7 32 Z"
              fill="#fef9c3"
            />
            {/* Book Spine Center Divider */}
            <line x1="30" y1="12" x2="30" y2="40" stroke="#b45309" strokeWidth="1.5" />
            {/* Text lines inside textbook */}
            <line x1="12" y1="16" x2="26" y2="19" stroke="#92400e" strokeWidth="1" />
            <line x1="12" y1="22" x2="25" y2="25" stroke="#92400e" strokeWidth="1" />
            <line x1="12" y1="28" x2="27" y2="31" stroke="#92400e" strokeWidth="1" />
            
            <line x1="34" y1="19" x2="48" y2="16" stroke="#92400e" strokeWidth="1" />
            <line x1="34" y1="25" x2="47" y2="22" stroke="#92400e" strokeWidth="1" />
            <line x1="34" y1="31" x2="49" y2="28" stroke="#92400e" strokeWidth="1" />

            {/* Hands Holding Book */}
            <ellipse cx="6" cy="24" rx="4" ry="5" fill="url(#skinBoyCenter)" />
            <ellipse cx="54" cy="24" rx="4" ry="5" fill="url(#skinBoyCenter)" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* CHARACTER 3 (RIGHT): Congolese Student (Girl) Digital Study */}
        {/* ========================================================= */}
        <g className="anim-breathe-3" id="student-girl-right">
          {/* Torso: Stylized School Cardigan (Mustard / Golden Yellow + White Shirt) */}
          <path
            d="M 380 200 L 390 135 Q 418 122 445 135 L 455 200 Z"
            fill="url(#uniformYellow)"
          />
          <polygon points="410,128 418,142 426,128" fill="#ffffff" />
          <polygon points="416,134 418,152 420,134" fill="#b45309" />

          {/* Head & Neck */}
          <rect x="411" y="108" width="14" height="20" rx="4" fill="url(#skinGirlRight)" />

          {/* Hair: Sleek High Puff / Natural Braids */}
          <ellipse cx="418" cy="84" rx="21" ry="23" fill="#171717" />
          <ellipse cx="418" cy="58" rx="16" ry="14" fill="#262626" />
          {/* Decorative Golden Hairpin */}
          <line x1="412" y1="58" x2="424" y2="58" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />

          {/* Face */}
          <ellipse cx="418" cy="87" rx="16" ry="17.5" fill="url(#skinGirlRight)" />
          {/* Ear with Pearl Stud */}
          <ellipse cx="434" cy="88" rx="3.5" ry="5" fill="#5e3417" />
          <circle cx="434" cy="90" r="1.5" fill="#ffffff" />

          {/* Friendly Eyes looking forward & slightly at tablet */}
          <ellipse cx="412" cy="85" rx="2.5" ry="1.6" fill="#ffffff" />
          <circle cx="411" cy="86" r="1.2" fill="#171717" />
          <ellipse cx="424" cy="85" rx="2.5" ry="1.6" fill="#ffffff" />
          <circle cx="423" cy="86" r="1.2" fill="#171717" />

          {/* Eyebrows */}
          <path d="M 409 81 Q 413 79 416 81" stroke="#171717" strokeWidth="1.2" fill="none" />
          <path d="M 420 81 Q 424 79 427 81" stroke="#171717" strokeWidth="1.2" fill="none" />

          {/* Radiant Smile */}
          <path d="M 414 95 Q 418 99 422 95" stroke="#9a3412" strokeWidth="1.4" fill="none" strokeLinecap="round" />

          {/* Arm pointing towards Digital Tablet on Desk */}
          <path
            d="M 405 145 Q 385 160 375 168"
            fill="none"
            stroke="url(#skinGirlRight)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <ellipse cx="372" cy="169" rx="4.5" ry="4" fill="url(#skinGirlRight)" />

          {/* Modern Digital Learning Tablet (SmartSchool App UI on Screen) */}
          <g className="anim-screen" transform="translate(335, 150)">
            {/* Tablet Chassis */}
            <rect x="0" y="0" width="46" height="32" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* Glowing Screen */}
            <rect x="3" y="3" width="40" height="26" rx="2" fill="#0f172a" />
            {/* Animated Educational App UI: Chart + Status */}
            <rect x="6" y="6" width="16" height="3" rx="1" fill="#38bdf8" />
            <line x1="6" y1="13" x2="22" y2="13" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="6" y1="17" x2="18" y2="17" stroke="#94a3b8" strokeWidth="0.8" />
            {/* Mini Progress Bar */}
            <rect x="6" y="21" width="28" height="4" rx="2" fill="#334155" />
            <rect x="6" y="21" width="22" height="4" rx="2" fill="#22c55e" />
            {/* Circular Badge on Tablet */}
            <circle cx="34" cy="11" r="5" fill="#6366f1" />
            <polygon points="34,8 35.5,13 32.5,13" fill="#ffffff" />
          </g>
        </g>

        {/* 5. DESK ACCESSORIES & STUDY GEAR */}
        <g>
          {/* Stack of Classic Hardcover Books (Left Side) */}
          <g transform="translate(85, 158)">
            <rect x="0" y="8" width="40" height="7" rx="1.5" fill="url(#bookEmerald)" />
            <rect x="2" y="2" width="37" height="6" rx="1.5" fill="url(#bookIndigo)" />
            <rect x="4" y="-3" width="34" height="5" rx="1.5" fill="url(#bookAmber)" />
          </g>

          {/* Pencil & Ruler Holder (Right Side) */}
          <g transform="translate(485, 142)">
            {/* Cup */}
            <rect x="6" y="16" width="18" height="26" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" className="dark:fill-slate-800 dark:stroke-slate-700" />
            {/* Pencils and Ruler sticking out */}
            <line x1="10" y1="8" x2="12" y2="20" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="15" y1="5" x2="15" y2="20" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="7" x2="18" y2="20" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            <rect x="8" y="2" width="5" height="18" rx="1" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" transform="rotate(-10 10 10)" />
          </g>
        </g>

        {/* 6. BOTTOM GRADIENT OVERLAY (Seamless Blend into Login Card) */}
        <rect
          x="0"
          y="175"
          width="600"
          height="25"
          fill="url(#bottomFade)"
          opacity="0.9"
        />
        <defs>
          <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
          </linearGradient>
        </defs>
      </svg>

      {/* SUBTLE BRAND PILL / MOTTO CHIP AT TOP */}
      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Élites de Demain
        </span>
      </div>

      <div className="absolute top-2.5 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-600/90 text-white backdrop-blur-xs shadow-2xs">
        <Sparkles className="h-3 w-3 text-amber-300 animate-spin" style={{ animationDuration: "8s" }} />
        <span className="text-[9.5px] font-black uppercase tracking-wider">
          RDC Éducation
        </span>
      </div>
    </div>
  );
});

CongoleseStudentsStudyAnimation.displayName = "CongoleseStudentsStudyAnimation";
