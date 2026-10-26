import React, { useEffect, useState } from 'react';
import { X, Sparkles, Heart, Gift, ArrowRight } from 'lucide-react';
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
      // Trigger animation on next frame for smooth entrance
      const raf = requestAnimationFrame(() => {
        setAnimateIn(true);
      });

      // Prevent body scrolling while modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = originalOverflow;
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        animateIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Light dark backdrop overlay with subtle blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Islamic Themed Modal Container */}
      <div
        className={`relative w-full max-w-md sm:max-w-[460px] rounded-3xl overflow-hidden border-2 border-[#d4af37]/60 shadow-[0_0_50px_rgba(212,175,55,0.28),0_25px_50px_rgba(0,0,0,0.85)] bg-gradient-to-b from-[#062c1d] via-[#041f14] to-[#02130d] text-center transform transition-all duration-300 ease-out select-none ${
          animateIn ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        {/* Intricate Islamic Geometric Background Pattern Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.07] bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23d4af37' fill-rule='evenodd'%3E%3Cpath d='M30 0l7.5 12.5 14-5-5 14L39 30l12.5 7.5-14 5 5 14L30 39l-7.5 12.5-14-5 5-14L21 30 8.5 22.5l14-5-5-14L30 21z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
          aria-hidden="true"
        />

        {/* Ambient Top Golden Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-36 bg-[#ffd700]/15 blur-3xl pointer-events-none" />

        {/* Top Decorative Islamic Ornaments & Close Button */}
        <div className="relative pt-6 px-6 pb-2">
          {/* Close button (✕) */}
          <button
            onClick={onClose}
            aria-label="পপ-আপ বন্ধ করুন"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 border border-[#d4af37]/40 hover:border-[#ffd700] text-[#fef08a] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md group active:scale-90"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* Central Islamic 8-Point Star Medallion (Khatam / Rub el Hizb) */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative mb-3">
            {/* Glowing Golden Ring */}
            <div className="absolute inset-0 rounded-full border border-[#d4af37]/50 shadow-[0_0_25px_rgba(212,175,55,0.5)] animate-pulse" />
            <div className="absolute inset-1.5 rounded-full border border-[#ffd700]/30" />

            {/* SVG Islamic 8-pointed star & crescent emblem */}
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_2px_10px_rgba(212,175,55,0.7)]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff3b0" />
                  <stop offset="50%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#996515" />
                </linearGradient>
              </defs>
              {/* Outer 8-point geometric star */}
              <polygon
                points="50,5 62,35 95,50 62,65 50,95 38,65 5,50 38,35"
                fill="url(#goldGradient)"
                opacity="0.9"
              />
              <polygon
                points="50,15 75,25 85,50 75,75 50,85 25,75 15,50 25,25"
                fill="#032014"
                stroke="url(#goldGradient)"
                strokeWidth="2"
              />
              {/* Inner Crescent Moon & Star */}
              <path
                d="M53 34 A14 14 0 1 0 63 60 A17 17 0 1 1 53 34 Z"
                fill="url(#goldGradient)"
              />
              <circle cx="63" cy="42" r="2.5" fill="#fff3b0" />
            </svg>
          </div>

          {/* Badge: ✨ বিশেষ সম্মানজনক অফার ✨ */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.25)] text-[#fef08a] text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
            <span>{badgeText}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 pb-6 pt-2 space-y-4">
          {/* Subtitle / Targeted Audience */}
          <div className="text-sm sm:text-base text-emerald-100/95 font-medium leading-relaxed max-w-xs mx-auto">
            {subtitleText}
          </div>

          {/* Ornate Golden Islamic Divider */}
          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto text-[#d4af37]/60">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
            <span className="text-[#ffd700] text-xs">◆ ۞ ◆</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
          </div>

          {/* Huge Golden Discount Highlight */}
          <div className="py-1">
            <div
              id="welcome-modal-title"
              className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-[#fff3b0] via-[#ffd700] to-[#f59e0b] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(212,175,55,0.5)]"
            >
              {discountText}
            </div>
          </div>

          {/* Warm Heartfelt Love Note */}
          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed max-w-sm mx-auto">
            {noteText}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            {/* Primary Button: “অফারটি গ্রহণ করুন” */}
            <button
              onClick={onClaimOffer}
              className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm sm:text-base text-zinc-950 bg-gradient-to-r from-[#ffe071] via-[#ffd700] to-[#e6b800] hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-[0_6px_25px_rgba(212,175,55,0.45)] flex items-center justify-center gap-2 border border-amber-200/60 cursor-pointer group"
            >
              <Gift className="w-5 h-5 text-zinc-900 group-hover:rotate-12 transition-transform duration-200" />
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4 text-zinc-900 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            {/* Subtle dismiss option */}
            <button
              onClick={onClose}
              className="text-xs text-emerald-300/70 hover:text-emerald-200 transition-colors py-1 cursor-pointer"
            >
              পরে দেখব / বন্ধ করুন
            </button>
          </div>
        </div>

        {/* Bottom Decorative Golden Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80" />
      </div>
    </div>
  );
};
