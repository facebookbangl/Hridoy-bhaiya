import React from 'react';
import { Lock, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onNavigateTo: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ settings, onOpenAdmin, onNavigateTo }) => {
  const cleanWa = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-[#120a17]/90 backdrop-blur-md border-b border-[#ff2a85]/20 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div 
          onClick={() => onNavigateTo('store-top')} 
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink-0 select-none"
          title="ZERO POINT FF - হোম পেজ"
        >
          <div className="relative shrink-0">
            {/* Glowing red & neon gaming gradient frame */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[2px] bg-gradient-to-tr from-red-600 via-[#ff2a55] to-orange-500 shadow-[0_0_14px_rgba(230,0,40,0.65)] group-hover:shadow-[0_0_22px_rgba(255,42,85,0.9)] transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
              <img 
                src={settings.logoUrl || '/zero_point_logo.png'} 
                alt="ZERO POINT FF Official Logo" 
                width="48"
                height="48"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/zero_point_logo.png') {
                    target.src = '/zero_point_logo.png';
                  }
                }}
                className="w-full h-full rounded-full object-cover aspect-square bg-black"
              />
            </div>
            {/* Live active shop badge */}
            <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-black text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full border border-black shadow-[0_0_8px_rgba(16,185,129,0.7)] tracking-wider">
              LIVE
            </span>
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-extrabold tracking-wider text-base sm:text-lg flex items-center gap-1.5 text-white leading-tight">
              ZERO POINT <span className="text-[#ff2a85] pink-glow-text">FF</span>
            </div>
          </div>
        </div>

        {/* Navigation Links for Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#d8b4d8]">
          <button 
            onClick={() => onNavigateTo('id-grid-section')} 
            className="hover:text-[#ff2a85] transition-colors whitespace-nowrap cursor-pointer"
          >
            আইডি সমূহ
          </button>
          <button 
            onClick={() => onNavigateTo('payment-numbers-section')} 
            className="hover:text-[#ff2a85] transition-colors whitespace-nowrap cursor-pointer"
          >
            পেমেন্ট মাধ্যম
          </button>
          <button 
            onClick={() => onNavigateTo('reviews-section')} 
            className="hover:text-[#ff2a85] transition-colors whitespace-nowrap cursor-pointer"
          >
            গ্রাহক রিভিউ
          </button>
          <button 
            onClick={() => onNavigateTo('rules-section')} 
            className="hover:text-[#ff2a85] transition-colors whitespace-nowrap cursor-pointer"
          >
            ডিল নিয়মাবলী
          </button>
          <button 
            onClick={() => onNavigateTo('social-media-section')} 
            className="hover:text-[#ff2a85] transition-colors whitespace-nowrap cursor-pointer"
          >
            সোশ্যাল মিডিয়া
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('হ্যালো ZERO POINT FF, আমি একটি ফ্রি ফায়ার আইডি সম্পর্কে জানতে চাই।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-full hover:bg-emerald-900/60 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>হোয়াটসঅ্যাপ</span>
          </a>

          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#ff2a85]/15 border border-[#ff2a85] rounded-full hover:bg-[#ff2a85] hover:shadow-[0_0_15px_rgba(255,42,133,0.5)] transition-all whitespace-nowrap cursor-pointer active:scale-95"
            title="Admin Dashboard"
          >
            <Lock className="w-3.5 h-3.5 text-[#ff2a85] group-hover:text-white" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
});
