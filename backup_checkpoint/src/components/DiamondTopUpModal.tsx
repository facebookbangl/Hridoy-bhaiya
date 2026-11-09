import React, { useState, useMemo } from 'react';
import { 
  X, Gem, Check, Copy, CheckCircle2, AlertCircle, ShieldCheck, 
  Sparkles, Ticket, Zap, ArrowRight, UserCheck, Loader2, Smartphone
} from 'lucide-react';
import { SiteSettings, TopUpCategory, TopUpPackage, Order } from '../types';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface DiamondTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  packages: TopUpPackage[];
  onOrderSuccess: (order: Order) => void;
  onShowToast: (msg: string) => void;
}

export const DiamondTopUpModal: React.FC<DiamondTopUpModalProps> = ({
  isOpen,
  onClose,
  settings,
  packages,
  onOrderSuccess,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TopUpCategory>('diamonds');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('dia_100');
  const [playerUid, setPlayerUid] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isCheckingName, setIsCheckingName] = useState<boolean>(false);
  const [nameCheckResult, setNameCheckResult] = useState<{
    status: 'idle' | 'success' | 'unavailable' | 'error';
    message?: string;
  }>({ status: 'idle' });

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [customerName, setCustomerName] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter packages by current category
  const categoryPackages = useMemo(() => {
    return packages.filter((pkg) => pkg.category === selectedCategory);
  }, [packages, selectedCategory]);

  // Selected package details
  const selectedPackage = useMemo(() => {
    return packages.find((pkg) => pkg.id === selectedPackageId) || categoryPackages[0];
  }, [packages, selectedPackageId, categoryPackages]);

  if (!isOpen) return null;

  // Active payment details
  const currentPayment = {
    method: paymentMethod,
    number: paymentMethod === 'bKash' 
      ? (settings.bkash || '01312452160') 
      : paymentMethod === 'Nagad' 
        ? (settings.nagad || '01869910404') 
        : (settings.rocket || '019XXXXXXXX'),
    type: 'Personal',
    methodName: 'Send Money'
  };

  const handleCopyNumber = (num: string) => {
    try {
      navigator.clipboard.writeText(num);
      setCopiedNumber(true);
      onShowToast(`${paymentMethod} নম্বর কপি করা হয়েছে!`);
      setTimeout(() => setCopiedNumber(false), 2000);
    } catch {
      onShowToast('নম্বর কপি করতে ব্যর্থ হয়েছে। ম্যানুয়ালি কপি করুন।');
    }
  };

  // Real Free Fire Player Name Check
  const handleCheckPlayerName = async () => {
    const cleanUid = playerUid.trim().replace(/[^0-9]/g, '');
    if (!cleanUid) {
      setNameCheckResult({
        status: 'error',
        message: 'অনুগ্রহ করে প্রথমে সঠিক প্লেয়ার আইডি (UID) নম্বর দিন।'
      });
      return;
    }

    if (cleanUid.length < 7 || cleanUid.length > 12) {
      setNameCheckResult({
        status: 'error',
        message: 'ফ্রি ফায়ার ইউআইডি সাধারণত ৭ থেকে ১২ ডিজিটের হয়ে থাকে।'
      });
      return;
    }

    setIsCheckingName(true);
    setNameCheckResult({ status: 'idle' });

    try {
      const res = await fetch(`/api/freefire-player-lookup?uid=${encodeURIComponent(cleanUid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.name) {
          setPlayerName(data.name);
          setNameCheckResult({
            status: 'success',
            message: `গেম আইডির নাম: ${data.name}`
          });
          onShowToast(`প্লেয়ার পাওয়া গেছে: ${data.name}`);
          setIsCheckingName(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Player lookup check network fallback:', err);
    }

    // Truthful fallback: never fabricate a fake name
    setPlayerName('');
    setNameCheckResult({
      status: 'unavailable',
      message: 'সার্ভার থেকে নাম স্বয়ংক্রিয়ভাবে পাওয়া যায়নি। আপনার UID সঠিক হলে নিশ্চিত হয়ে অর্ডার কনফার্ম করতে পারেন।'
    });
    setIsCheckingName(false);
  };

  // Order Submission
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) {
      onShowToast('অনুগ্রহ করে একটি ডায়মন্ড বা মেম্বারশিপ প্যাকেজ সিলেক্ট করুন!');
      return;
    }

    const cleanUid = playerUid.trim().replace(/[^0-9]/g, '');
    if (!cleanUid || cleanUid.length < 7) {
      onShowToast('সঠিক প্লেয়ার আইডি কোড (UID) প্রদান করুন!');
      return;
    }

    const cleanSender = senderNumber.trim().replace(/[^0-9]/g, '');
    if (!cleanSender || cleanSender.length < 11) {
      onShowToast('সঠিক ১১ ডিজিটের প্রেরক নম্বর দিন!');
      return;
    }

    const cleanTrx = trxId.trim();
    if (!cleanTrx || cleanTrx.length < 6) {
      onShowToast('সঠিক TrxID (Transaction ID) প্রদান করুন!');
      return;
    }

    setIsSubmitting(true);

    // Verify price with backend if available
    let verifiedPrice = selectedPackage.price;
    try {
      const verifyRes = await fetch('/api/verify-topup-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selectedPackage.id, clientPrice: selectedPackage.price })
      });
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData.verified && typeof verifyData.serverPrice === 'number') {
          verifiedPrice = verifyData.serverPrice;
        }
      }
    } catch {
      // Netlify or offline fallback uses verified client price
    }

    const orderId = `TOPUP-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      type: 'diamond_topup',
      accountId: selectedPackage.id,
      accountCode: selectedPackage.name,
      price: verifiedPrice,
      method: paymentMethod,
      customerName: customerName.trim() || 'সম্মানিত গেমার',
      senderNumber: cleanSender,
      trxId: cleanTrx.toUpperCase(),
      status: 'Pending',
      timestamp: new Date().toISOString(),
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      playerUid: cleanUid,
      playerName: playerName.trim() || undefined
    };

    onOrderSuccess(newOrder);

    // Build rich formatted receipt for WhatsApp
    const waMessage = `আসসালামু আলাইকুম ZERO POINT FF,
আমি একটি ফ্রি ফায়ার ডায়মন্ড টপ-আপ অর্ডার করেছি। নিচে বিস্তারিত দেওয়া হলো:

💎 প্যাকেজ: ${selectedPackage.name}
💰 মূল্য: ${verifiedPrice} ৳ (রেফারেন্স মূল্য ${selectedPackage.referencePrice}৳ থেকে ${selectedPackage.discountTk}৳ সাশ্রয়)
🎮 প্লেয়ার UID: ${cleanUid}${playerName ? `\n👤 গেম নাম: ${playerName}` : ''}

💳 পেমেন্ট মাধ্যম: ${paymentMethod} (Send Money)
📱 প্রেরকের নম্বর: ${cleanSender}
🔢 TrxID: ${cleanTrx.toUpperCase()}
🔖 অর্ডার আইডি: ${orderId}
📌 স্ট্যাটাস: Pending (যাচাইয়ের অপেক্ষায়)

দয়া করে আমার পেমেন্ট ও ইউআইডি চেক করে ডায়মন্ড পাঠিয়ে দিন।`;

    const waUrl = formatWhatsAppUrl(settings.whatsappNumber, waMessage);

    onShowToast('টপ-আপ অর্ডার সফলভাবে তৈরি হয়েছে! হোয়াটসঅ্যাপে পাঠানো হচ্ছে...');

    setTimeout(() => {
      setIsSubmitting(false);
      window.location.href = waUrl;
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-3xl relative border-2 border-[#ff2a85]/40 shadow-[0_0_60px_rgba(255,42,133,0.3)] flex flex-col bg-gradient-to-b from-[#150a24] via-[#0d0718] to-[#07040d]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-[#150a24]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#ff2a85]/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-[#ff2a85] p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.6)] shrink-0">
              <div className="w-full h-full bg-[#0d071a] rounded-[14px] flex items-center justify-center">
                <Gem className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg leading-tight tracking-wide flex items-center gap-1.5">
                  <span>Free Fire Diamond Top-Up</span>
                </h3>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-black bg-gradient-to-r from-[#ff2a85] to-amber-500 text-white rounded-full shadow-[0_0_10px_rgba(255,42,133,0.5)]">
                  ৫–১০৳ ছাড়
                </span>
              </div>
              <p className="text-[11px] text-[#e0c8e0] leading-tight mt-0.5 font-medium">
                প্লেয়ার UID দিয়ে সরাসরি ইনস্ট্যান্ট ডায়মন্ড ও মেম্বারশিপ নিন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ff2a85] text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Category Tabs */}
          <div>
            <div className="flex items-center gap-2 p-1.5 bg-[#09040e]/90 border border-white/10 rounded-2xl overflow-x-auto shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('diamonds');
                  const firstDia = packages.find((p) => p.category === 'diamonds');
                  if (firstDia) setSelectedPackageId(firstDia.id);
                }}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'diamonds'
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-[1.01]'
                    : 'text-[#d8b4d8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Gem className="w-3.5 h-3.5" />
                <span>ডায়মন্ড</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('membership');
                  const firstMem = packages.find((p) => p.category === 'membership');
                  if (firstMem) setSelectedPackageId(firstMem.id);
                }}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'membership'
                    ? 'bg-gradient-to-r from-[#ff2a85] via-pink-600 to-purple-600 text-white shadow-[0_0_20px_rgba(255,42,133,0.6)] scale-[1.01]'
                    : 'text-[#d8b4d8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>মেম্বারশিপ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('level_up');
                  const firstLvl = packages.find((p) => p.category === 'level_up');
                  if (firstLvl) setSelectedPackageId(firstLvl.id);
                }}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'level_up'
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-[1.01]'
                    : 'text-[#d8b4d8] hover:text-white hover:bg-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>লেভেল আপ পাস</span>
              </button>
            </div>
          </div>

          {/* Product Cards Grid (2-column on mobile, 3-col on tablet/desktop) */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff2a85]" />
                <span>প্যাকেজ নির্বাচন করুন:</span>
              </span>
              <span className="text-[11px] text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                সব প্যাকেজে ৫–১০৳ কম!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
              {categoryPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;

                // Color-coded badge themes
                let badgeStyle = "bg-gradient-to-r from-[#ff2a85] to-rose-500 text-white";
                if (pkg.badge === 'সেরা ডিল') {
                  badgeStyle = "bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black";
                } else if (pkg.badge === 'কম্বো অফার') {
                  badgeStyle = "bg-gradient-to-r from-purple-500 to-indigo-500 text-white";
                } else if (pkg.badge === 'বাজেট') {
                  badgeStyle = "bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black";
                }

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`relative p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between select-none ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#250d3a] via-[#1a082b] to-[#10051d] border-2 border-[#ff2a85] shadow-[0_0_25px_rgba(255,42,133,0.4)] scale-[1.02]'
                        : 'bg-[#12081e]/90 hover:bg-[#1b0d2d]/90 border border-white/10 hover:border-cyan-400/50 shadow-sm'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <span className={`absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-md ${badgeStyle}`}>
                        {pkg.badge}
                      </span>
                    )}

                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          pkg.category === 'diamonds' 
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                            : pkg.category === 'membership'
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {pkg.category === 'diamonds' ? (
                            <Gem className="w-3.5 h-3.5" />
                          ) : pkg.category === 'membership' ? (
                            <Ticket className="w-3.5 h-3.5" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <div className="font-extrabold text-white text-xs sm:text-sm leading-tight">
                          {pkg.name}
                        </div>
                      </div>

                      {/* Radio indicator */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'border-[#ff2a85] bg-[#ff2a85] text-white shadow-[0_0_8px_rgba(255,42,133,0.8)]' 
                          : 'border-white/25 bg-black/40'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mt-auto pt-2.5 border-t border-white/10 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-[#ffe259] drop-shadow-[0_0_8px_rgba(255,226,89,0.35)]">
                          {pkg.price} ৳
                        </span>
                        <span className="text-[11px] text-zinc-500 line-through">
                          {pkg.referencePrice} ৳
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                        -{pkg.discountTk}৳
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Information — Free Fire UID */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#11071c]/90 border border-white/10 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="player-uid-input" 
                className="text-xs sm:text-sm font-black text-white flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>এখানে প্লেয়ার আইডি কোড দিন (Player UID)</span>
              </label>
              <span className="text-[11px] text-zinc-400 font-semibold">ইন-গেম UID</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="player-uid-input"
                type="text"
                inputMode="numeric"
                required
                value={playerUid}
                onChange={(e) => {
                  setPlayerUid(e.target.value);
                  setNameCheckResult({ status: 'idle' });
                }}
                placeholder="যেমন: 1234567890"
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />

              <button
                type="button"
                onClick={handleCheckPlayerName}
                disabled={isCheckingName || !playerUid.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95 shadow-sm"
              >
                {isCheckingName ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <span>আপনার গেম আইডির নাম চেক করুন</span>
                )}
              </button>
            </div>

            {/* Validation Feedback */}
            {nameCheckResult.status === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-bold">{nameCheckResult.message}</span>
              </div>
            )}

            {nameCheckResult.status === 'unavailable' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span className="leading-relaxed">{nameCheckResult.message}</span>
              </div>
            )}

            {nameCheckResult.status === 'error' && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{nameCheckResult.message}</span>
              </div>
            )}
          </div>

          {/* Payment Method Section (Using Store bKash / Nagad / Rocket) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#11071c]/90 border border-white/10 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#ff2a85]" />
                <span>পেমেন্ট মাধ্যম নির্বাচন করুন (Send Money)</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>১০০% নিরাপদ</span>
              </span>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('bKash')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'bKash'
                    ? 'bg-[#d12053]/30 border-[#d12053] text-pink-300 shadow-[0_0_15px_rgba(209,32,83,0.5)] scale-[1.01]'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <span>bKash (বিকাশ)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Nagad')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'Nagad'
                    ? 'bg-[#f7941d]/30 border-[#f7941d] text-orange-300 shadow-[0_0_15px_rgba(247,148,29,0.5)] scale-[1.01]'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <span>Nagad (নগদ)</span>
              </button>

              {settings.rocketStatus === 'Enabled' && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Rocket')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'Rocket'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-[1.01]'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>Rocket (রকেট)</span>
                </button>
              )}
            </div>

            {/* Display Number & One-Click Copy */}
            <div className="p-4 rounded-xl bg-black/70 border border-white/15 flex items-center justify-between gap-3 shadow-inner">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  {currentPayment.method} ({currentPayment.type} • {currentPayment.methodName}) নম্বর:
                </div>
                <div className="text-base sm:text-xl font-black font-mono text-white tracking-wider mt-0.5">
                  {currentPayment.number}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyNumber(currentPayment.number)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#ff2a85] text-white text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm"
              >
                {copiedNumber ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Number</span>
                  </>
                )}
              </button>
            </div>

            {/* Form Fields: Sender Number & TrxID */}
            <form onSubmit={handleConfirmOrder} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#d8b4d8] mb-1 font-semibold">
                    আপনার নাম (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: তানভীর"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#ff2a85]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#d8b4d8] mb-1 font-semibold">
                    যে নম্বর থেকে টাকা পাঠিয়েছেন <span className="text-[#ff2a85]">*</span>:
                  </label>
                  <input
                    type="text"
                    inputMode="tel"
                    required
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#ff2a85]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#d8b4d8] mb-1 font-semibold">
                  লেনদেনের TrxID (Transaction ID) <span className="text-[#ff2a85]">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="যেমন: 9X8Y7Z6W"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm uppercase placeholder:text-zinc-600 focus:outline-none focus:border-[#ff2a85]"
                />
              </div>

              {/* Order Summary & Submit Card */}
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1d0b2e] via-black to-[#130720] border-2 border-[#ff2a85]/40 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
                  <span className="text-zinc-400 font-medium">নির্বাচিত প্যাকেজ:</span>
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <Gem className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedPackage?.name}</span>
                  </span>
                </div>

                {playerUid && (
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
                    <span className="text-zinc-400 font-medium">প্লেয়ার UID:</span>
                    <span className="font-bold font-mono text-cyan-300">
                      {playerUid} {playerName ? `(${playerName})` : ''}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm sm:text-base pt-1">
                  <span className="font-black text-white">মোট প্রদেয় মূল্য:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#ffe259] drop-shadow-[0_0_10px_rgba(255,226,89,0.4)]">
                      {selectedPackage?.price} ৳
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-500 line-through">
                      {selectedPackage?.referencePrice} ৳
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !playerUid.trim() || !senderNumber.trim() || !trxId.trim()}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-[#ff2a85] via-[#ff1475] to-purple-600 hover:from-[#ff1475] hover:to-purple-700 shadow-[0_0_30px_rgba(255,42,133,0.6)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>অর্ডার যাচাই ও প্রস্তুত হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>টপ-আপ অর্ডার কনফার্ম করুন</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
