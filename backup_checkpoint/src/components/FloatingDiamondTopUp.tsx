import React, { useState, useEffect } from 'react';
import { Gem, Sparkles, X } from 'lucide-react';

interface FloatingDiamondTopUpProps {
  onOpenTopUp: () => void;
}

export const FloatingDiamondTopUp: React.FC<FloatingDiamondTopUpProps> = ({ onOpenTopUp }) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem('zp_topup_widget_dismissed') === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  });

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('zp_topup_widget_dismissed', 'true');
      }
    } catch {
      // ignore
    }
  };

  // If dismissed by the member, remove it from screen
  if (isDismissed) return null;

  return (
    <aside
      aria-label="Free Fire Diamond Top-Up Floating Window"
      className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 z-30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="relative group">
        {/* Member Remove / Dismiss Button */}
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="ফ্লোটিং উইন্ডো বন্ধ করুন"
          title="উইন্ডোটি সরিয়ে ফেলুন"
          className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-[#1b0d2a] border border-[#ff2a85]/60 hover:border-white text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 z-20 cursor-pointer"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Main Floating Trigger Button with Frosted Glass */}
        <button
          onClick={onOpenTopUp}
          type="button"
          className="relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#120824]/75 backdrop-blur-xl border border-cyan-400/50 hover:border-cyan-300 text-white shadow-[0_8px_32px_rgba(6,182,212,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,42,133,0.5)] transition-all duration-300 active:scale-95 cursor-pointer hover:-translate-y-0.5 select-none"
          title="ফ্রি ফায়ার ডায়মন্ড ও মেম্বারশিপ টপ-আপ"
        >
          {/* Animated Ambient Cyber Glow */}
          <span className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-[#ff2a85] to-purple-600 rounded-2xl opacity-45 group-hover:opacity-90 blur-sm transition-opacity pointer-events-none" />

          {/* Diamond Icon with rotating glow */}
          <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-[#ff2a85] p-0.5 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.7)] shrink-0 group-hover:scale-105 transition-transform">
            <span className="w-full h-full bg-[#0d071a] rounded-[10px] flex items-center justify-center">
              <Gem className="w-5 h-5 text-cyan-300 animate-pulse" />
            </span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-black animate-ping" />
          </span>

          {/* Label & Savings Badge */}
          <div className="relative flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black tracking-wide text-white group-hover:text-cyan-200">
                ডায়মন্ড টপ-আপ
              </span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                ৫-১০৳ ছাড়
              </span>
              <span className="text-[9px] text-[#ff6cb5] font-semibold">
                ইনস্ট্যান্ট UID
              </span>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};
