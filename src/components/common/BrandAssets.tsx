import React from 'react';

export function LegalMetLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Blue Hexagonal Emblem */}
        <path
          d="M20 2L35.5885 11V29L20 38L4.41154 29V11L20 2Z"
          fill="#1E40AF"
          stroke="#3B82F6"
          strokeWidth="1.5"
        />
        {/* Inner balanced scale / shield geometry */}
        <path
          d="M20 10V28M13 16L20 12L27 16M13 18C13 20 15 22 17 22C19 22 20 20 20 18M20 18C20 20 21 22 23 22C25 22 27 20 27 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="9" r="1.5" fill="#60A5FA" />
      </svg>
    </div>
  );
}

export function AshokaEmblem({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <g fill="#1E293B">
          {/* Abacus / bell-shaped capital base */}
          <rect x="35" y="176" width="130" height="10" rx="2" />
          <path d="M42 176 C42 158 50 150 60 150 L140 150 C150 150 158 158 158 176 Z" />
          <rect x="30" y="186" width="140" height="8" rx="2" />
          <rect x="24" y="194" width="152" height="10" rx="2" />

          {/* Small dharma chakras + bull/horse silhouettes on abacus (simplified) */}
          <circle cx="65" cy="163" r="7" fill="none" stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="135" cy="163" r="7" fill="none" stroke="#1E293B" strokeWidth="2.5" />
          <ellipse cx="100" cy="164" rx="10" ry="6" fill="#1E293B" />

          {/* Three visible lions standing back to back on the drum */}
          {/* Center-front lion (fully visible) */}
          <path d="M100 45
                   C 88 45 80 55 80 68
                   C 80 78 84 84 82 92
                   C 79 104 75 116 75 128
                   C 75 140 84 150 100 150
                   C 116 150 125 140 125 128
                   C 125 116 121 104 118 92
                   C 116 84 120 78 120 68
                   C 120 55 112 45 100 45 Z" />
          {/* mane texture lines */}
          <g stroke="#F8FAFC" strokeWidth="1.4" opacity="0.55">
            <path d="M88 62 L94 66" />
            <path d="M112 62 L106 66" />
            <path d="M85 74 L93 76" />
            <path d="M115 74 L107 76" />
            <path d="M83 90 L92 90" />
            <path d="M117 90 L108 90" />
            <path d="M80 106 L90 104" />
            <path d="M120 106 L110 104" />
          </g>
          {/* ears & face */}
          <circle cx="90" cy="50" r="5" />
          <circle cx="110" cy="50" r="5" />
          <circle cx="94" cy="58" r="2" fill="#F8FAFC" />
          <circle cx="106" cy="58" r="2" fill="#F8FAFC" />

          {/* Left partial lion (profile, mostly hidden behind center) */}
          <path d="M58 70 C 50 72 44 80 44 92 C 44 104 50 116 52 128
                   C 54 138 60 146 70 148 C 66 132 64 116 66 100
                   C 67 88 64 78 58 70 Z" />
          {/* Right partial lion (profile, mostly hidden behind center) */}
          <path d="M142 70 C 150 72 156 80 156 92 C 156 104 150 116 148 128
                   C 146 138 140 146 130 148 C 134 132 136 116 134 100
                   C 133 88 136 78 142 70 Z" />
        </g>
        {/* Ashoka Chakra on the front face of the abacus, centered under the lions */}
        <circle cx="100" cy="177" r="6.5" fill="none" stroke="#1E3A8A" strokeWidth="1.6" />
        <g stroke="#1E3A8A" strokeWidth="0.8">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / 24;
            const x2 = 100 + 6.5 * Math.cos(angle);
            const y2 = 177 + 6.5 * Math.sin(angle);
            return <line key={i} x1="100" y1="177" x2={x2} y2={y2} />;
          })}
        </g>
      </svg>
    </div>
  );
}

export function TricolorRibbon({ className = "h-1 w-full" }: { className?: string }) {
  return (
    <div className={`flex ${className}`}>
      <div className="flex-1 bg-[#FF9933]"></div>
      <div className="flex-1 bg-white border-y border-slate-100"></div>
      <div className="flex-1 bg-[#138808]"></div>
    </div>
  );
}