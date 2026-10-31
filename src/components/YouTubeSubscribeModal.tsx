import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Flame, Sparkles, Check, Copy, CheckCircle2, 
  ExternalLink, ArrowRight, ShieldCheck, Clock, Gift, Shield
} from 'lucide-react';
import { SiteSettings } from '../types';

export const YOUTUBE_MAIN_CHANNEL_URL = 'https://youtube.com/@freefireidbuyandsellbangladesh?si=kdpGdfjCvR3IWODk';
export const YOUTUBE_BACKUP_CHANNEL_URL = 'https://youtube.com/@zeropoint_backup?si=lC2DNWd6Iy8upP61';
export const YOUTUBE_CHANNEL_URL = YOUTUBE_BACKUP_CHANNEL_URL;
export const YOUTUBE_COUPON_CODE = 'YT100';
export const YOUTUBE_DISCOUNT_AMOUNT = 100;

interface YouTubeSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onApplyDiscount?: (code: string) => void;
  onNavigateToIds?: () => void;
  onShowToast: (msg: string) => void;
}

export const YouTubeSubscribeModal: React.FC<YouTubeSubscribeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onApplyDiscount,
  onNavigateToIds,
  onShowToast,
}) => {
  // Verification states: 'initial' | 'verifying' | 'unlocked'
  const [step, setStep] = useState<'initial' | 'verifying' | 'unlocked'>('initial');
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [clickTimestamp, setClickTimestamp] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isVerifyingApi, setIsVerifyingApi] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const mainChannelUrl = settings.youtubeChannelUrl || YOUTUBE_MAIN_CHANNEL_URL;
  const backupChannelUrl = settings.youtubeBackupChannelUrl || YOUTUBE_BACKUP_CHANNEL_URL;

  // Check if user already claimed this previously
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const alreadyClaimed = window.localStorage.getItem('zp_yt_discount_claimed') === 'true';
        if (alreadyClaimed) {
          setStep('unlocked');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Handle countdown during 'verifying' step
  useEffect(() => {
    if (step !== 'verifying') return;

    setTimeLeft(10);
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [step]);

  // Complete verification once countdown reaches 0
  useEffect(() => {
    if (step === 'verifying' && timeLeft === 0) {
      completeVerification();
    }
  }, [step, timeLeft]);

  // Handle YouTube Subscribe click for either channel
  const handleSubscribeClick = (channelName: string) => {
    const now = Date.now();
    setClickTimestamp(now);
    // Switch to verifying state
    setStep('verifying');
    onShowToast(`${channelName} ওপেন হয়েছে। সাবস্ক্রাইব করে ১০ সেকেন্ড অপেক্ষা করুন!`);
  };

  // Complete verification after 10-second countdown
  const completeVerification = async () => {
    setIsVerifyingApi(true);

    try {
      // Server-side verification request
      const res = await fetch('/api/verify-youtube-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clickTimestamp: clickTimestamp || (Date.now() - 10000),
          mainChannel: mainChannelUrl,
          backupChannel: backupChannelUrl
        })
      });

      if (res.ok) {
        await res.json();
      }
    } catch (err) {
      console.info('Client-side 10-second fallback used:', err);
    } finally {
      setIsVerifyingApi(false);
      setStep('unlocked');

      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('zp_yt_discount_claimed', 'true');
          window.sessionStorage.setItem('zp_active_coupon', YOUTUBE_COUPON_CODE);
        }
      } catch {}

      if (onApplyDiscount) {
        onApplyDiscount(YOUTUBE_COUPON_CODE);
      }

      onShowToast('🎉 অভিনন্দন! আপনার ১০০ টাকা ডিসকাউন্ট কোড আনলক হয়েছে!');
    }
  };

  // Copy coupon code
  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(YOUTUBE_COUPON_CODE);
      setCopiedCode(true);
      onShowToast(`কুপন কোড '${YOUTUBE_COUPON_CODE}' কপি করা হয়েছে!`);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      onShowToast(`কুপন কোড: ${YOUTUBE_COUPON_CODE}`);
    }
  };

  // Claim & explore accounts
  const handleClaimAndShop = () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('zp_yt_discount_seen', 'true');
        window.sessionStorage.setItem('zp_active_coupon', YOUTUBE_COUPON_CODE);
      }
    } catch {}

    if (onApplyDiscount) {
      onApplyDiscount(YOUTUBE_COUPON_CODE);
    }

    onClose();
    if (onNavigateToIds) {
      onNavigateToIds();
    }
    onShowToast('১০০ টাকা ডিসকাউন্ট কোড আপনার চেকআউটের জন্য অ্যাক্টিভেট রয়েছে!');
  };

  // Close and mark seen for this session
  const handleClose = () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('zp_yt_discount_seen', 'true');
      }
    } catch {}
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-gradient-to-b from-[#1c0c03] via-[#0f0602] to-[#070301] border-2 border-orange-500/60 shadow-[0_0_60px_rgba(249,115,22,0.45),0_25px_60px_rgba(0,0,0,0.95)] text-white select-none animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Fire & Orange Glow Spotlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-gradient-to-b from-orange-500/35 via-amber-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-64 h-48 bg-red-600/20 blur-3xl pointer-events-none" />

        {/* Free Fire Geometric Accent Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z' fill='%23f97316' /%3E%3C/svg%3E")`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Header Bar */}
        <div className="relative z-10 px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between border-b border-orange-500/20">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.5)]">
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 leading-tight">
                Special Gaming Deal
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1 leading-tight">
                ZERO POINT <span className="text-orange-400">FF</span>
              </span>
            </div>
          </div>

          {/* Close (×) Button */}
          <button
            onClick={handleClose}
            type="button"
            aria-label="পপ-আপ বন্ধ করুন"
            title="বন্ধ করুন"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-orange-500 hover:text-black border border-white/15 text-zinc-300 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="relative z-10 p-5 sm:p-7 text-center space-y-4">
          
          {/* STEP 1: INITIAL OFFER STATE */}
          {step === 'initial' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500/25 to-red-500/25 border border-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs font-black text-amber-200 tracking-wide">
                  🔥 আমাদের YouTube চ্যানেল সাবস্ক্রাইব করুন! 🔥
                </span>
              </div>

              {/* Huge Bright ৳১০০ Discount Display */}
              <div className="py-1 space-y-1">
                <div className="text-[11px] sm:text-xs font-bold text-orange-300/90 uppercase tracking-widest">
                  সাবস্ক্রাইব করুন আর পেয়ে যান
                </div>
                <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200 drop-shadow-[0_0_25px_rgba(249,115,22,0.85)] tracking-tight">
                  ৳১০০ ডিসকাউন্ট!
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-sm mx-auto leading-relaxed pt-1">
                  “আমাদের যেকোনো চ্যানেল সাবস্ক্রাইব করুন এবং পেয়ে যান ১০০ টাকা ডিসকাউন্ট!”
                </p>
              </div>

              {/* BOTH CHANNELS ACTION BUTTONS */}
              <div className="space-y-2.5 pt-1">
                <div className="text-[11px] font-bold text-amber-300/90 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                  <span>আমাদের দুটি ইউটিউব চ্যানেল:</span>
                </div>

                {/* 1. Main YouTube Channel Button */}
                <a
                  href={mainChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSubscribeClick('মেইন চ্যানেল')}
                  className="group relative w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF0000] via-[#E60000] to-[#CC0000] hover:from-[#FF1A1A] hover:to-[#B30000] text-white font-black text-sm shadow-[0_0_20px_rgba(255,0,0,0.55)] hover:shadow-[0_0_30px_rgba(255,0,0,0.8)] transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 active:scale-98 select-none no-underline border border-red-400/40"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-lg bg-white text-[#FF0000] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
                      <svg className="w-4 h-4 fill-[#FF0000] ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] text-red-200 font-semibold uppercase tracking-wider">
                        চ্যানেল ১ · মেইন চ্যানেল
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-white">
                        FREE FIRE ID BUY & SELL BD
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl shrink-0">
                    <span>সাবস্ক্রাইব</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/90" />
                  </div>
                </a>

                {/* 2. Backup YouTube Channel Button */}
                <a
                  href={backupChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSubscribeClick('ব্যাকআপ চ্যানেল')}
                  className="group relative w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-sm shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:shadow-[0_0_30px_rgba(249,115,22,0.75)] transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 active:scale-98 select-none no-underline border border-orange-400/40"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-200 font-semibold uppercase tracking-wider">
                        চ্যানেল ২ · ব্যাকআপ চ্যানেল
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-white">
                        ZERO POINT BACKUP (@zeropoint_backup)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold bg-black/30 hover:bg-black/40 px-3 py-1.5 rounded-xl shrink-0">
                    <span>সাবস্ক্রাইব</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/90" />
                  </div>
                </a>
              </div>

              {/* T&C Highlight Box */}
              <div className="p-3 rounded-2xl bg-black/60 border border-orange-500/30 text-left space-y-1.5 text-xs text-zinc-300">
                <div className="font-bold text-orange-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>অফারের শর্ত ও সুবিধা:</span>
                </div>
                <ul className="space-y-1 text-[11px] text-zinc-300 leading-normal pl-4 list-disc">
                  <li>যেকোনো চ্যানেলে সাবস্ক্রাইব করার পর ১০ সেকেন্ডের মধ্যে ডিসকাউন্ট কোড আনলক হবে।</li>
                  <li>যেকোনো ফ্রি ফায়ার আইডি ক্রয়ে বা ডায়মন্ড টপ-আপে প্রযোজ্য।</li>
                  <li>সব আপডেট ও নতুন আইডি ড্রপ পেতে দুটি চ্যানেলই সাবস্ক্রাইব করে রাখুন।</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: 10-SECOND VERIFICATION COUNTDOWN STATE */}
          {step === 'verifying' && (
            <div className="space-y-5 py-2 animate-in fade-in duration-200">
              {/* Radar Scanner Animation */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping opacity-60" />
                <div className="absolute inset-1 rounded-full border-2 border-amber-400/40 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(249,115,22,0.7)] font-black text-2xl font-mono">
                  {timeLeft}s
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  সাবস্ক্রিপশন যাচাইকরণ চলছে...
                </h4>
                <p className="text-xs text-orange-200 mt-1 max-w-sm mx-auto leading-relaxed">
                  অনুগ্রহ করে মিনিমাম ১০ সেকেন্ড অপেক্ষা করুন। টাইমার শেষ হলে স্বয়ংক্রিয়ভাবে আপনার ১০০ টাকা ডিসকাউন্ট কোড আনলক হবে।
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-orange-500/30 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-300 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                    style={{ width: `${Math.min(100, ((10 - timeLeft) / 10) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>ভেরিফিকেশন প্রসেস</span>
                  <span className="text-orange-300 font-bold">{Math.round(((10 - timeLeft) / 10) * 100)}%</span>
                </div>
              </div>

              {/* Re-open channel buttons if needed */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <a
                  href={mainChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-white underline decoration-red-500/50"
                >
                  <span>মেইন চ্যানেল লিংক</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-zinc-500 hidden sm:inline">|</span>
                <a
                  href={backupChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-orange-300 hover:text-white underline decoration-orange-500/50"
                >
                  <span>ব্যাকআপ চ্যানেল লিংক</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* STEP 3: UNLOCKED SUCCESS STATE */}
          {step === 'unlocked' && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              {/* Success Badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 mx-auto flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,0.7)] animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-1">
                  ভেরিফিকেশন সফল!
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  অভিনন্দন! ১০০ টাকা ডিসকাউন্ট আনলক হয়েছে 🎉
                </h4>
                <p className="text-xs text-zinc-300 mt-1">
                  নিচের কুপন কোডটি দিয়ে সরাসরি ১০০ টাকা ছাড় উপভোগ করুন:
                </p>
              </div>

              {/* Coupon Code Display Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-black/80 via-[#1e0a02] to-black/80 border-2 border-dashed border-amber-400/70 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(251,191,36,0.25)]">
                <div className="text-left">
                  <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                    আপনার ডিসকাউন্ট কুপন কোড:
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                    {YOUTUBE_COUPON_CODE}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 stroke-[2.5]" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Both channels links in unlocked screen */}
              <div className="p-3 rounded-xl bg-black/60 border border-orange-500/30 text-left space-y-2 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>সব সময় যুক্ত থাকতে আমাদের উভয় চ্যানেলে সাবস্ক্রাইব করুন:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <a
                    href={mainChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 text-red-200 text-[11px] font-bold flex items-center justify-between transition-all"
                  >
                    <span>🔴 মেইন চ্যানেল</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={backupChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-orange-600/20 border border-orange-500/40 hover:bg-orange-600/30 text-orange-200 text-[11px] font-bold flex items-center justify-between transition-all"
                  >
                    <span>🛡️ ব্যাকআপ চ্যানেল</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-left text-xs text-zinc-300 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                  <Gift className="w-3.5 h-3.5 text-orange-400" />
                  <span>ডিসকাউন্ট ব্যবহারের নিয়ম:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-300">
                  ১. যেকোনো আইডি ক্রয়ে চেকআউটে <strong>{YOUTUBE_COUPON_CODE}</strong> কুপন দিন।<br />
                  ২. অথবা হোয়াটসঅ্যাপে কেনার সময় এই কোড ও সাবস্ক্রিপশন স্ক্রিনশট পাঠিয়ে ১০০ টাকা ক্যাশ ছাড় নিন।
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleClaimAndShop}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-black font-black text-sm sm:text-base shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>আইডি কালেকশন দেখুন ও ছাড় নিন</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
