import React from 'react';
import ministryEmblemGold from '../../assets/ministry-emblem-gold.png';

export function LegalMetLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="legalmet-logo-g" x1="20" y1="20" x2="236" y2="236" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#146BFF" />
            <stop offset="1" stopColor="#0B43B8" />
          </linearGradient>
        </defs>

        {/* LegalMet AI mark: shield + balanced scales + AI spark */}
        <path
          d="M128 14 222 48v72c0 58-37 99-94 122-57-23-94-64-94-122V48l94-34Z"
          fill="url(#legalmet-logo-g)"
        />
        <path
          d="M128 29 207 58v61c0 49-30 84-79 106-49-22-79-57-79-106V58l79-29Z"
          fill="none"
          stroke="#fff"
          strokeWidth="7"
          opacity=".95"
        />

        {/* AI spark */}
        <path d="m128 55 7 20 20 7-20 7-7 20-7-20-20-7 20-7 7-20Z" fill="#fff" />

        {/* Justice scales */}
        <path
          d="M128 96v73M99 104h58M128 169h-28M128 169h28"
          fill="none"
          stroke="#fff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m99 104-20 31h40l-20-31Zm58 0-20 31h40l-20-31Z"
          fill="none"
          stroke="#fff"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path d="M109 188h38" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function AshokaEmblem({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={ministryEmblemGold}
        alt="State Emblem of India — Lion Capital of Ashoka"
        className="w-full h-full object-contain"
      />
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