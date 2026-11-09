import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Copy, Check, MessageCircle, ShieldCheck, Sparkles, 
  ArrowRight, ArrowLeft, RefreshCw, Smartphone, CheckCircle2,
  AlertCircle, Lock, ExternalLink
} from 'lucide-react';
import { Account, SiteSettings, Order } from '../types';
import { formatWhatsAppUrl, OFFICIAL_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { trackPixelInitiateCheckout, trackPixelPurchase, trackPixelContact } from '../utils/metaPixel';
import { safeSessionGet } from '../utils/safeStorage';

interface CheckoutModalProps {
  account: Account | null;
  settings: SiteSettings;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onShowToast: (msg: string) => void;
}

// Official-style SVG Logo for bKash Personal
const BKashLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 8 L90 32 L62 50 L90 80 L50 64 L30 92 L30 50 L10 32 Z" fill="#e2136e" />
    <path d="M50 8 L62 50 L30 50 Z" fill="#ff4d94" />
    <path d="M62 50 L90 80 L50 64 Z" fill="#b30953" />
    <path d="M50 64 L30 92 L30 50 Z" fill="#d11166" />
  </svg>
);

// Official-style SVG Logo for Nagad Personal
const NagadLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="44" fill="#f7941d" />
    <path d="M50 18 C63 18 76 28 76 44 C76 63 55 75 47 81 C45 82 41 79 43 73 C47 63 59 57 57 47 C55 39 47 37 43 41 C39 45 39 53 33 55 C29 57 25 53 27 47 C29 32 39 18 50 18 Z" fill="#ffffff" />
    <path d="M48 48 C44 52 44 58 50 62 C54 64 56 68 52 72 C48 76 40 72 38 66 C36 58 42 52 48 48 Z" fill="#f15a24" />
  </svg>
);

type PaymentStep = 'copy_number' | 'enter_trx' | 'processing' | 'redirecting';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  account,
  settings,
  onClose,
  onOrderSuccess,
  onShowToast,
}) => {
  // Step 1: copy_number, Step 2: enter_trx, Step 3: processing, Step 4: redirecting
  const [step, setStep] = useState<PaymentStep>('copy_number');
  const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [hasCopiedNumber, setHasCopiedNumber] = useState<boolean>(false);
  const [trxId, setTrxId] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube Subscription & Promotional Coupon System (Preserved)
  const [appliedCoupon] = useState<string | null>(() => {
    const active = safeSessionGet('zp_active_coupon');
    return active === 'YT100' ? 'YT100' : null;
  });

  if (!account) return null;

  // Track Meta Pixel InitiateCheckout event
  useEffect(() => {
    if (account) {
      trackPixelInitiateCheckout(account);
    }
  }, [account?.id]);

  // Clean up any pending redirects on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const discountAmount = appliedCoupon === 'YT100' ? 100 : 0;
  const finalPrice = Math.max(0, account.price - discountAmount);

  // Dynamic Theme Definitions for bKash and Nagad
  const isBkash = method === 'bKash';
  const paymentNumber = isBkash 
    ? (settings.bkash || '01312452160') 
    : (settings.nagad || '01869910404');

  const theme = isBkash ? {
    name: 'bKash Personal',
    provider: 'bKash',
    color: '#e2136e',
    textColor: 'text-[#e2136e]',
    bgLight: 'bg-[#e2136e]/10',
    borderLight: 'border-[#e2136e]/30',
    glow: 'shadow-[0_0_30px_rgba(226,19,110,0.25)]',
    btnBg: 'bg-[#e2136e] hover:bg-[#c20e5c]',
    btnBorder: 'border-[#e2136e]',
    badgeBg: 'bg-[#e2136e]',
    badgeText: 'text-pink-100',
    headerGradient: 'from-[#e2136e]/20 via-[#e2136e]/5 to-transparent',
    accentBorder: 'border-[#e2136e]/40',
  } : {
    name: 'Nagad Personal',
    provider: 'Nagad',
    color: '#f7941d',
    textColor: 'text-[#f7941d]',
    bgLight: 'bg-[#f7941d]/10',
    borderLight: 'border-[#f7941d]/30',
    glow: 'shadow-[0_0_30px_rgba(247,148,29,0.25)]',
    btnBg: 'bg-gradient-to-r from-[#f7941d] to-[#f15a24] hover:from-[#e07f0f] hover:to-[#d94814]',
    btnBorder: 'border-[#f7941d]',
    badgeBg: 'bg-[#f7941d]',
    badgeText: 'text-amber-100',
    headerGradient: 'from-[#f7941d]/20 via-[#f7941d]/5 to-transparent',
    accentBorder: 'border-[#f7941d]/40',
  };

  // Switch payment method and reset copy state
  const handleSelectMethod = (newMethod: 'bKash' | 'Nagad') => {
    if (newMethod !== method) {
      setMethod(newMethod);
      setHasCopiedNumber(false);
    }
  };

  // Copy payment number to clipboard
  const handleCopyNumber = () => {
    try {
      navigator.clipboard.writeText(paymentNumber);
      setHasCopiedNumber(true);
      onShowToast(`${theme.name} নম্বর (${paymentNumber}) সফলভাবে কপি করা হয়েছে!`);
    } catch {
      // Fallback
      setHasCopiedNumber(true);
      onShowToast(`${theme.name} নম্বর (${paymentNumber}) কপি হয়েছে!`);
    }
  };

  // Proceed to Step 2 (Transaction ID Screen)
  const handleProceedToTrx = () => {
    if (!hasCopiedNumber) {
      onShowToast('অনুগ্রহ করে প্রথমে পেমেন্ট নম্বরটি কপি করুন!');
      return;
    }
    setStep('enter_trx');
  };

  // Submit Transaction ID and trigger Step 3 (Processing) & Step 4 (Redirect)
  const handleSubmitTrx = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTrxId = trxId.trim().toUpperCase();
    if (!cleanTrxId) {
      onShowToast('অনুগ্রহ করে আপনার Transaction ID লিখুন!');
      return;
    }

    if (cleanTrxId.length < 4) {
      onShowToast('অনুগ্রহ করে সঠিক Transaction ID লিখুন!');
      return;
    }

    // Step 3: Switch to Animated Payment Processing Screen
    setStep('processing');
    setProcessingProgress(15);

    // Record order in system with 'Pending' status (No customer name or sender number required)
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      accountId: account.id,
      accountCode: account.code,
      price: finalPrice,
      customerName: 'Customer',
      senderNumber: '',
      method: method,
      trxId: cleanTrxId,
      status: 'Pending',
      timestamp: new Date().toLocaleString('bn-BD'),
      couponCode: appliedCoupon || undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
    };

    onOrderSuccess(newOrder);

    // Track Pixel Events
    trackPixelPurchase(newOrder);
    trackPixelContact(`WhatsApp Payment: ${account.code}`);

    // Formulate the EXACT Automatic WhatsApp Message requested
    const formattedMessage = `আসসালামু আলাইকুম।

আমি ZERO POINT FF থেকে পেমেন্ট করেছি।

Payment Method: ${theme.name}
Transaction ID: ${cleanTrxId}

অ্যাকাউন্ট কোড: ${account.code}
মূল্য: ${finalPrice} ৳

আমার পেমেন্টটি যাচাই করে অর্ডারটি Confirm করে দিন।

ধন্যবাদ।
ZERO POINT FF`;

    const targetWaNumber = settings.whatsappNumber || OFFICIAL_WHATSAPP_NUMBER;
    const waUrl = formatWhatsAppUrl(targetWaNumber, formattedMessage);
    setRedirectUrl(waUrl);

    // Smooth Progress Simulation
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 450);

    // Step 4: After processing (approx 2.2 seconds), switch to WhatsApp Redirect Screen
    setTimeout(() => {
      clearInterval(interval);
      setProcessingProgress(100);
      setStep('redirecting');

      // Auto-open WhatsApp after smooth transition
      redirectTimerRef.current = setTimeout(() => {
        window.location.href = waUrl;
      }, 1400);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-3xl overflow-hidden relative border transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.95)] ${theme.borderLight} ${theme.glow} bg-[#0c0612] text-white`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Band */}
        <div className={`h-1.5 w-full ${isBkash ? 'bg-gradient-to-r from-[#e2136e] via-pink-400 to-[#e2136e]' : 'bg-gradient-to-r from-[#f7941d] via-orange-400 to-[#f15a24]'}`} />

        {/* Modal Top Bar: ZERO POINT FF Brand & Close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff2a85] animate-ping" />
            <span className="font-extrabold text-sm tracking-wide text-white">ZERO POINT <span className="text-[#ff2a85]">FF</span></span>
            <span className="text-[10px] text-zinc-400">· Official Payment</span>
          </div>

          {step !== 'processing' && step !== 'redirecting' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Account Brief Header (Always visible for user confidence) */}
        <div className="px-5 py-3 bg-gradient-to-b from-white/[0.04] to-transparent border-b border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img 
              src={account.image} 
              alt={account.title} 
              className="w-11 h-11 rounded-xl object-cover border border-white/15 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-black text-[#ff2a85] tracking-wider">{account.code}</span>
                <span className="text-[10px] bg-white/10 text-zinc-300 px-1.5 py-0.2 rounded font-mono">Lv.{account.level}</span>
              </div>
              <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1 max-w-[200px] sm:max-w-xs">{account.title}</h4>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-zinc-400 block font-medium">পরিশোধিত মূল্য</span>
            <div className="text-base sm:text-lg font-black text-white tabular-nums">
              {finalPrice.toLocaleString('bn-BD')}
              <span className={`text-xs ml-1 font-bold ${theme.textColor}`}>৳</span>
            </div>
            {appliedCoupon && (
              <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded">
                -১০০৳ ছাড়
              </span>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* SCREEN 1: COPY NUMBER SCREEN (Step: copy_number)              */}
        {/* ============================================================== */}
        {step === 'copy_number' && (
          <div className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
            {/* Payment Method Switcher Tabs (bKash & Nagad) */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-2">
                ১. পেমেন্ট মেথড নির্বাচন করুন:
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* bKash Tab */}
                <button
                  type="button"
                  onClick={() => handleSelectMethod('bKash')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                    isBkash
                      ? 'bg-gradient-to-r from-[#e2136e]/20 to-black/60 border-[#e2136e] shadow-[0_0_20px_rgba(226,19,110,0.3)] ring-1 ring-[#e2136e]/60'
                      : 'bg-black/40 border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shrink-0 shadow-md">
                    <BKashLogo className="w-full h-full" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>bKash</span>
                      {isBkash && <Check className="w-3.5 h-3.5 text-[#e2136e]" />}
                    </div>
                    <span className="text-[10px] text-pink-200 block">Personal · Send Money</span>
                  </div>
                </button>

                {/* Nagad Tab */}
                <button
                  type="button"
                  onClick={() => handleSelectMethod('Nagad')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                    !isBkash
                      ? 'bg-gradient-to-r from-[#f7941d]/20 to-black/60 border-[#f7941d] shadow-[0_0_20px_rgba(247,148,29,0.3)] ring-1 ring-[#f7941d]/60'
                      : 'bg-black/40 border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shrink-0 shadow-md">
                    <NagadLogo className="w-full h-full" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>Nagad</span>
                      {!isBkash && <Check className="w-3.5 h-3.5 text-[#f7941d]" />}
                    </div>
                    <span className="text-[10px] text-amber-200 block">Personal · Send Money</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Official-Inspired Payment Box (bKash Pink or Nagad Orange) */}
            <div className={`rounded-2xl border p-4 sm:p-5 transition-all relative overflow-hidden bg-gradient-to-b ${theme.headerGradient} ${theme.accentBorder}`}>
              {/* Header Title with Official-styled Icon */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shrink-0 shadow">
                    {isBkash ? <BKashLogo className="w-full h-full" /> : <NagadLogo className="w-full h-full" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{theme.name}</span>
                    </h3>
                    <p className="text-[10px] text-zinc-300">নিচের নম্বরে Send Money করুন</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} text-white shadow-sm`}>
                  Send Money
                </span>
              </div>

              {/* Large Payment Number Display & Copy Button */}
              <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-black/70 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-medium uppercase tracking-wider">
                    {theme.provider} পার্সোনাল নম্বর:
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white tabular-nums select-all block mt-0.5">
                    {paymentNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-lg active:scale-95 ${
                    hasCopiedNumber
                      ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                      : `${theme.btnBg} text-white`
                  }`}
                >
                  {hasCopiedNumber ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic instruction notice */}
              <div className="mt-3 text-[11px] text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  আপনার <strong className="text-white">{theme.provider}</strong> অ্যাপ থেকে <strong className="text-white">{finalPrice} ৳</strong> পাঠান।
                </span>
              </div>
            </div>

            {/* Next Button with Enforced Copy Requirement */}
            <div>
              <button
                type="button"
                onClick={handleProceedToTrx}
                disabled={!hasCopiedNumber}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  hasCopiedNumber
                    ? `${theme.btnBg} text-white cursor-pointer shadow-lg active:scale-98 animate-pulse-subtle`
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
                }`}
              >
                <span>পরবর্তী ধাপ (Next)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!hasCopiedNumber && (
                <p className="text-[11px] text-zinc-400 text-center mt-2 flex items-center justify-center gap-1">
                  <span>* পরবর্তী ধাপে যেতে প্রথমে ওপরের নম্বরটি কপি করুন।</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 2: TRANSACTION ID SCREEN (Step: enter_trx)             */}
        {/* ============================================================== */}
        {step === 'enter_trx' && (
          <form onSubmit={handleSubmitTrx} className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('copy_number')}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="আগের ধাপে ফিরুন"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-white">২. Transaction ID প্রদান করুন</h3>
                  <p className="text-[10px] text-zinc-400">{theme.name}-এ টাকা পাঠানোর পর পাওয়া TrxID লিখুন</p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shrink-0 shadow">
                {isBkash ? <BKashLogo className="w-full h-full" /> : <NagadLogo className="w-full h-full" />}
              </div>
            </div>

            {/* Target sent amount reminder */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
              <span className="text-zinc-300">পরিশোধিত একাউন্ট মূল্য:</span>
              <span className="font-mono font-bold text-base text-white">{finalPrice} ৳</span>
            </div>

            {/* ONLY ONE INPUT FIELD: TRANSACTION ID (Strict requirement) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white flex items-center justify-between">
                <span>Transaction ID (TrxID) <span className="text-[#ff2a85]">*</span></span>
                <span className="text-[10px] text-zinc-400 font-normal">মেসেজ বা অ্যাপ হিস্ট্রি থেকে কপি করুন</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="যেমন: BL92KA87 বা 9M5K7P2Q"
                  className={`w-full px-4 py-3.5 rounded-xl bg-black/80 border text-white placeholder-zinc-500 text-sm font-mono uppercase tracking-widest focus:outline-none transition-all ${
                    trxId.trim() ? `${theme.borderLight} ring-1 ring-${isBkash ? '[#e2136e]' : '[#f7941d]'}` : 'border-white/20 focus:border-white/40'
                  }`}
                />
              </div>

              <p className="text-[11px] text-zinc-400 pt-1 leading-relaxed">
                টাকা পাঠানোর পর প্রাপ্ত কনফার্মেশন এসএমএস অথবা {theme.provider} অ্যাপের লেনদেন বিবরণীতে এই TrxID দেখতে পাবেন।
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('copy_number')}
                className="px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                পেছনে যান
              </button>

              <button
                type="submit"
                disabled={!trxId.trim()}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
                  trxId.trim()
                    ? `${theme.btnBg} shadow-[0_4px_20px_rgba(255,42,133,0.35)]`
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                }`}
              >
                <span>পেমেন্ট তথ্য সাবমিট করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* SCREEN 3: PAYMENT PROCESSING SCREEN (Step: processing)        */}
        {/* ============================================================== */}
        {step === 'processing' && (
          <div className="p-8 sm:p-10 text-center space-y-6 animate-in fade-in duration-300">
            {/* Animated Processing Spinner / Radar */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className={`absolute inset-0 rounded-full border-2 border-dashed ${isBkash ? 'border-[#e2136e]' : 'border-[#f7941d]'} animate-spin`} style={{ animationDuration: '4s' }} />
              {/* Soft glow */}
              <div className={`absolute inset-2 rounded-full ${theme.bgLight} blur-md animate-pulse`} />
              {/* Center icon */}
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-lg">
                <RefreshCw className={`w-7 h-7 ${theme.textColor} animate-spin`} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Payment Processing...
              </h3>
              <p className="text-sm font-semibold text-zinc-200">
                আপনার পেমেন্ট তথ্য প্রসেস করা হচ্ছে।
              </p>
              <p className="text-xs text-zinc-400">
                অনুগ্রহ করে অপেক্ষা করুন...
              </p>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full max-w-xs mx-auto space-y-1.5">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${isBkash ? 'bg-[#e2136e]' : 'bg-gradient-to-r from-[#f7941d] to-[#f15a24]'}`}
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                {processingProgress}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 max-w-sm mx-auto">
              আইডি: <strong className="text-white font-mono">{account.code}</strong> · ট্রানজেকশন আইডি: <strong className="text-white font-mono">{trxId.toUpperCase()}</strong>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 4: WHATSAPP REDIRECT SCREEN (Step: redirecting)        */}
        {/* ============================================================== */}
        {step === 'redirecting' && (
          <div className="p-8 sm:p-10 text-center space-y-6 animate-in fade-in duration-300">
            {/* Animated WhatsApp Radar Wave */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-2 rounded-full bg-emerald-500/30 blur-sm" />
              <div className="relative z-10 w-16 h-16 rounded-3xl bg-[#25D366] text-white flex items-center justify-center shadow-[0_0_30px_rgba(37,211,102,0.6)]">
                <MessageCircle className="w-9 h-9 fill-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Redirecting to WhatsApp...
              </h3>
              <p className="text-sm font-semibold text-zinc-200">
                আপনাকে WhatsApp-এ নিয়ে যাওয়া হচ্ছে।
              </p>
              <p className="text-xs text-zinc-400">
                অনুগ্রহ করে অপেক্ষা করুন...
              </p>
            </div>

            {/* Manual Clickable Fallback Button */}
            <div className="pt-2 space-y-2 max-w-xs mx-auto">
              <a
                href={redirectUrl}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>সরাসরি WhatsApp-এ যান</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[10px] text-zinc-500">
                স্বয়ংক্রিয়ভাবে ওপেন না হলে উপরের বাটনে ক্লিক করুন।
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
