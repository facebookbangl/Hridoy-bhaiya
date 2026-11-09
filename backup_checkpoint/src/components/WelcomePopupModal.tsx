import React, { useEffect, useState } from 'react';
import { X, Sparkles, Gift, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface WelcomePopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimOffer: () => void;
  settings: SiteSettings;
}

export const WelcomePopupModal: React.FC<WelcomePopupModalProps> = ({
  isOpen,
  onClose,
  onClaimOffer,
  settings,
}) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setAnimateIn(true);
      }, 30);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setAnimateIn(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const badgeText = settings.welcomePopupBadge || '✨ বিশেষ সম্মানজনক অফার ✨';
  const subtitleText = settings.welcomePopupSubtitle || 'প্রবাসী এবং মাদ্রাসার সম্মানিত ভাই ও বোনদের জন্য';
  const discountText = settings.welcomePopupDiscount || 'সারা বছর ১৫% ডিসকাউন্ট!';
  const noteText = settings.welcomePopupNote || 'আপনাদের জন্য আমাদের পক্ষ থেকে বিশেষ ছাড় ও ভালোবাসা। ❤️';
  const buttonText = settings.welcomePopupButtonText || 'অফারটি গ্রহণ করুন';

  return (
    <aside
      aria-label="বিশেষ অফার নোটিফিকেশন"
      className={`fixed bottom-20 right-4 sm:bottom-20 sm:right-6 z-50 w-[calc(100vw-32px)] max-w-[360px] transition-all duration-500 ease-out pointer-events-auto ${
        animateIn
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#d4af37]/70 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(212,175,55,0.25)] bg-gradient-to-br from-[#062c1d] via-[#041f14] to-[#02130d] text-zinc-100 p-4 select-none">
        {/* Subtle Islamic Geometric Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23d4af37' fill-rule='evenodd'%3E%3Cpath d='M30 0l7.5 12.5 14-5-5 14L39 30l12.5 7.5-14 5 5 14L30 39l-7.5 12.5-14-5 5-14L21 30 8.5 22.5l14-5-5-14L30 21z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '36px 36px',
          }}
          aria-hidden="true"
        />

        {/* Ambient Top Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#ffd700]/20 blur-2xl pointer-events-none" />

        {/* Close button (✕) */}
        <button
          onClick={onClose}
          aria-label="নোটিফিকেশন বন্ধ করুন"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 border border-[#d4af37]/40 hover:border-[#ffd700] text-[#fef08a] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm group active:scale-90 z-10"
        >
          <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* Top Header Row with Mini Crescent/Star Emblem and Badge */}
        <div className="flex items-center gap-2.5 pr-7 mb-2">
          {/* Mini Islamic 8-Point Star Medallion */}
          <div className="w-8 h-8 rounded-full bg-[#032014] border border-[#d4af37]/60 shadow-[0_0_12px_rgba(212,175,55,0.4)] flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-[#ffd700]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="50,5 62,35 95,50 62,65 50,95 38,65 5,50 38,35"
                fill="#ffd700"
                opacity="0.9"
              />
              <path
                d="M53 34 A14 14 0 1 0 63 60 A17 17 0 1 1 53 34 Z"
                fill="#062c1d"
              />
              <circle cx="63" cy="42" r="2.5" fill="#ffd700" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-[#d4af37]/50 text-[#fef08a] text-[11px] font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3 h-3 text-[#ffd700]" />
            <span className="truncate">{badgeText}</span>
          </div>
        </div>

        {/* Subtitle & Golden Discount */}
        <div className="space-y-1 mb-2.5">
          <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium leading-snug">
            {subtitleText}
          </p>
          <div className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-[#fff3b0] via-[#ffd700] to-[#f59e0b] bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgba(212,175,55,0.4)]">
            {discountText}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-200/80 leading-tight">
            {noteText}
          </p>
        </div>

        {/* Action Button: “অফারটি গ্রহণ করুন” */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#d4af37]/20">
          <button
            onClick={onClaimOffer}
            className="flex-1 py-2 px-3 rounded-lg font-bold text-xs text-zinc-950 bg-gradient-to-r from-[#ffe071] via-[#ffd700] to-[#e6b800] hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_15px_rgba(212,175,55,0.35)] flex items-center justify-center gap-1.5 border border-amber-200/60 cursor-pointer group"
          >
            <Gift className="w-3.5 h-3.5 text-zinc-900 group-hover:rotate-12 transition-transform duration-200" />
            <span>{buttonText}</span>
            <ArrowRight className="w-3 h-3 text-zinc-900 group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>

          <button
            onClick={onClose}
            className="py-2 px-2.5 rounded-lg bg-black/40 hover:bg-black/60 text-[10px] text-emerald-300/80 hover:text-white transition-colors cursor-pointer border border-white/5"
          >
            বন্ধ
          </button>
        </div>

        {/* Bottom Decorative Golden Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-75" />
      </div>
    </aside>
  );
};
