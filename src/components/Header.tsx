import React from 'react';
import { Lock, MessageCircle, Gem } from 'lucide-react';
import { SiteSettings } from '../types';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface HeaderProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onNavigateTo: (sectionId: string) => void;
  onOpenWelcomePopup?: () => void;
  onOpenTopUp?: () => void;
  onOpenYouTubePopup?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ settings, onOpenAdmin, onNavigateTo, onOpenWelcomePopup, onOpenTopUp, onOpenYouTubePopup }) => {

  return (
    <header className="sticky top-0 z-40 bg-[#0e0716]/65 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div 
          onClick={() => onNavigateTo('store-top')} 
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink-0 select-none"
          title="ZERO POINT FF - হোম পেজ"
        >
          <div className="relative shrink-0">
            {/* Glowing red & neon gaming gradient frame with glass glow */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[2px] bg-gradient-to-tr from-red-600 via-[#ff2a55] to-orange-500 shadow-[0_0_16px_rgba(230,0,40,0.7)] group-hover:shadow-[0_0_24px_rgba(255,42,85,0.95)] transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
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

        {/* Navigation Links for Desktop with Glass Pill Hovers */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-xs font-semibold text-[#d8b4d8]">
          <button 
            onClick={() => onNavigateTo('id-grid-section')} 
            className="px-3 py-1.5 rounded-xl hover:bg-white/[0.08] hover:text-white border border-transparent hover:border-white/10 transition-all cursor-pointer whitespace-nowrap"
          >
            আইডি সমূহ
          </button>
          <button 
            onClick={() => onNavigateTo('payment-numbers-section')} 
            className="px-3 py-1.5 rounded-xl hover:bg-white/[0.08] hover:text-white border border-transparent hover:border-white/10 transition-all cursor-pointer whitespace-nowrap"
          >
            পেমেন্ট মাধ্যম
          </button>
          <button 
            onClick={() => onNavigateTo('reviews-section')} 
            className="px-3 py-1.5 rounded-xl hover:bg-white/[0.08] hover:text-white border border-transparent hover:border-white/10 transition-all cursor-pointer whitespace-nowrap"
          >
            গ্রাহক রিভিউ
          </button>
          <button 
            onClick={() => onNavigateTo('rules-section')} 
            className="px-3 py-1.5 rounded-xl hover:bg-white/[0.08] hover:text-white border border-transparent hover:border-white/10 transition-all cursor-pointer whitespace-nowrap"
          >
            ডিল নিয়মাবলী
          </button>
          <button 
            onClick={() => onNavigateTo('social-media-section')} 
            className="px-3 py-1.5 rounded-xl hover:bg-white/[0.08] hover:text-white border border-transparent hover:border-white/10 transition-all cursor-pointer whitespace-nowrap"
          >
            সোশ্যাল মিডিয়া
          </button>
          <a 
            href={formatWhatsAppUrl(settings.whatsappNumber, 'আসসালামু আলাইকুম ZERO POINT FF, আমি আমার একটি ফ্রি ফায়ার একাউন্ট বিক্রি করতে চাই।')} 
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-400 font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span>একাউন্ট বিক্রি করুন</span>
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

          {onOpenYouTubePopup && settings.youtubePopupEnabled !== false && (
            <button
              onClick={onOpenYouTubePopup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-black text-amber-200 bg-gradient-to-r from-red-600/30 via-orange-600/30 to-amber-600/30 border border-orange-500/40 rounded-full hover:border-orange-400 hover:scale-105 shadow-[0_0_15px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all whitespace-nowrap cursor-pointer active:scale-95"
              title="YouTube চ্যানেল সাবস্ক্রাইব করে ১০০ টাকা ডিসকাউন্ট নিন!"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>🔥 ১০০৳ অফার</span>
            </button>
          )}

          {onOpenWelcomePopup && settings.welcomePopupEnabled !== false && (
            <button
              onClick={onOpenWelcomePopup}
              className="hidden xs:inline-flex items-center gap-1 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-400/40 rounded-full hover:bg-amber-500/25 hover:border-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md transition-all whitespace-nowrap cursor-pointer active:scale-95"
              title="প্রবাসী ও মাদ্রাসা ভাই-বোনদের জন্য ১৫% বিশেষ সম্মানজনক অফার"
            >
              <span>✨ ১৫% অফার</span>
            </button>
          )}

          <a
            href={formatWhatsAppUrl(settings.whatsappNumber, 'হ্যালো ZERO POINT FF, আমি একটি ফ্রি ফায়ার আইডি সম্পর্কে জানতে চাই।')}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 rounded-full hover:bg-emerald-900/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md transition-all whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>হোয়াটসঅ্যাপ</span>
          </a>

          <button
            onClick={onOpenAdmin}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.08] border border-white/15 text-zinc-300 hover:text-white hover:bg-[#ff2a85] hover:border-[#ff2a85] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all cursor-pointer active:scale-95 shrink-0"
            title="এডমিন প্যানেল"
            aria-label="এডমিন প্যানেল"
          >
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
});
