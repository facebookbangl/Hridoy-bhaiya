import React, { useState } from 'react';
import { 
  X, Copy, Check, MessageCircle, ShieldCheck, Sparkles, 
  AlertCircle, Smartphone, Clock, CheckCircle2, Info 
} from 'lucide-react';
import { Account, SiteSettings, Order } from '../types';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface CheckoutModalProps {
  account: Account | null;
  settings: SiteSettings;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onShowToast: (msg: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  account,
  settings,
  onClose,
  onOrderSuccess,
  onShowToast,
}) => {
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [customerName, setCustomerName] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!account) return null;

  const isRocketEnabled = settings.rocketStatus === 'Enabled';
  const rocketStatusLabel = settings.rocketStatus || 'Coming Soon';

  // Get active provider details
  const getActivePaymentDetails = () => {
    if (method === 'bKash') {
      return {
        provider: 'bKash',
        number: settings.bkash || '01312452160',
        accountType: 'Personal',
        methodName: 'Send Money',
        brandColor: '#e2136e',
        badgeBg: 'bg-[#e2136e]',
        borderGlow: 'border-[#e2136e]/50 shadow-[0_0_20px_rgba(226,19,110,0.2)]'
      };
    }
    if (method === 'Nagad') {
      return {
        provider: 'Nagad',
        number: settings.nagad || '01869910404',
        accountType: 'Personal',
        methodName: 'Send Money',
        brandColor: '#f7941d',
        badgeBg: 'bg-[#f7941d]',
        borderGlow: 'border-[#f7941d]/50 shadow-[0_0_20px_rgba(247,148,29,0.2)]'
      };
    }
    return {
      provider: 'Rocket',
      number: settings.rocket || '019XXXXXXXX',
      accountType: 'Personal',
      methodName: 'Send Money',
      brandColor: '#8c3494',
      badgeBg: 'bg-[#8c3494]',
      borderGlow: 'border-[#8c3494]/50 shadow-[0_0_20px_rgba(140,52,148,0.2)]'
    };
  };

  const currentPayment = getActivePaymentDetails();

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentPayment.number);
    setCopiedSuccess(true);
    onShowToast(`${currentPayment.provider} নম্বর (${currentPayment.number}) সফলভাবে কপি করা হয়েছে!`);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submitting with disabled Rocket
    if (method === 'Rocket' && !isRocketEnabled) {
      onShowToast('Rocket পেমেন্ট বর্তমানে সাময়িকভাবে বন্ধ আছে। দয়া করে bKash বা Nagad নির্বাচন করুন।');
      return;
    }

    if (!customerName.trim()) {
      onShowToast('দয়া করে আপনার নাম লিখুন!');
      return;
    }

    if (!senderNumber.trim()) {
      onShowToast('যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন!');
      return;
    }

    if (!trxId.trim()) {
      onShowToast('পেমেন্টের ট্রানজেকশন আইডি (TrxID) লিখুন!');
      return;
    }

    setIsSubmitting(true);

    // Keep order status strictly 'Pending' until admin verifies
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      accountId: account.id,
      accountCode: account.code,
      price: account.price,
      customerName: customerName.trim(),
      senderNumber: senderNumber.trim(),
      method: method,
      trxId: trxId.trim().toUpperCase(),
      status: 'Pending',
      timestamp: new Date().toLocaleString('bn-BD')
    };

    onOrderSuccess(newOrder);

    // Formulate pre-filled WhatsApp message
    const message = `আসসালামু আলাইকুম ZERO POINT FF,
আমি একটি ফ্রি ফায়ার আইডি অর্ডার করেছি।

🆔 আইডি কোড: ${account.code}
💰 মূল্য: ${account.price} ৳
👤 ক্রেতার নাম: ${customerName.trim()}
📱 প্রেরক নম্বর: ${senderNumber.trim()}
💳 পেমেন্ট মাধ্যম: ${method} (${currentPayment.methodName})
🧾 TrxID: ${trxId.trim().toUpperCase()}
📌 স্ট্যাটাস: Pending (যাচাইয়ের অপেক্ষায়)

দয়া করে আমার পেমেন্ট ও TrxID চেক করে একাউন্ট ডেলিভারি দিন।`;

    const waUrl = formatWhatsAppUrl(settings.whatsappNumber, message);

    onShowToast('অর্ডার সংরক্ষিত হয়েছে (স্ট্যাটাস: Pending)! হোয়াটসঅ্যাপে পাঠানো হচ্ছে...');

    setTimeout(() => {
      setIsSubmitting(false);
      window.location.href = waUrl;
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-3xl p-5 sm:p-6 relative border border-[#ff2a85]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#ff2a85]/20 border border-[#ff2a85]/40 flex items-center justify-center text-[#ff2a85]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">অর্ডার ও পেমেন্ট সম্পন্ন করুন</h3>
            <p className="text-xs text-[#d8b4d8]">সরাসরি Send Money করে TrxID দিয়ে নিশ্চিত করুন</p>
          </div>
        </div>

        {/* Selected Item Summary Card */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img 
              src={account.image} 
              alt={account.title} 
              className="w-14 h-14 rounded-xl object-cover border border-[#ff2a85]/30"
            />
            <div>
              <span className="text-xs font-bold text-[#ff2a85] tracking-wider font-mono">{account.code}</span>
              <h4 className="text-sm font-semibold text-white line-clamp-1">{account.title}</h4>
              <p className="text-[11px] text-[#d8b4d8]">লেভেল {account.level} · {account.evo} ইভো গান</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
              {account.price.toLocaleString('bn-BD')}
              <span className="text-base font-bold text-[#ff2a85] ml-1">৳</span>
            </span>
          </div>
        </div>

        {/* ================= STEP 1: SELECT PAYMENT METHOD TABS ================= */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-pink-200 mb-2">
            ১. পেমেন্ট মাধ্যম নির্বাচন করুন:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* bKash Tab */}
            <button
              type="button"
              onClick={() => setMethod('bKash')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                method === 'bKash'
                  ? 'bg-[#e2136e]/20 border-[#e2136e] shadow-[0_0_15px_rgba(226,19,110,0.3)]'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#e2136e]" />
              <span className="text-xs sm:text-sm font-bold text-white">bKash</span>
              <span className="text-[10px] text-zinc-300">Personal</span>
            </button>

            {/* Nagad Tab */}
            <button
              type="button"
              onClick={() => setMethod('Nagad')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                method === 'Nagad'
                  ? 'bg-[#f7941d]/20 border-[#f7941d] shadow-[0_0_15px_rgba(247,148,29,0.3)]'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#f7941d]" />
              <span className="text-xs sm:text-sm font-bold text-white">Nagad</span>
              <span className="text-[10px] text-zinc-300">Personal</span>
            </button>

            {/* Rocket Tab (Coming Soon / Disabled by default) */}
            <button
              type="button"
              disabled={!isRocketEnabled}
              onClick={() => isRocketEnabled && setMethod('Rocket')}
              className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 relative ${
                !isRocketEnabled
                  ? 'opacity-60 bg-black/30 border-dashed border-zinc-700 cursor-not-allowed'
                  : method === 'Rocket'
                  ? 'bg-[#8c3494]/20 border-[#8c3494] shadow-[0_0_15px_rgba(140,52,148,0.3)] cursor-pointer'
                  : 'bg-black/40 border-white/10 hover:border-white/20 cursor-pointer'
              }`}
              title={!isRocketEnabled ? 'Rocket পেমেন্ট শীঘ্রই চালু হবে' : 'Rocket'}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#8c3494]" />
              <span className="text-xs sm:text-sm font-bold text-zinc-300">Rocket</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                {rocketStatusLabel}
              </span>
            </button>
          </div>
        </div>

        {/* ================= STEP 2: DISPLAY ONLY SELECTED PAYMENT METHOD DETAILS ================= */}
        <div className={`p-4 rounded-2xl bg-black/60 border ${currentPayment.borderGlow} mb-5 transition-all`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${currentPayment.badgeBg}`} />
              <span className="text-sm font-bold text-white">
                {currentPayment.provider} ({currentPayment.accountType})
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ff2a85]/20 text-pink-200 border border-[#ff2a85]/40">
              শুধুমাত্র {currentPayment.methodName}
            </span>
          </div>

          {/* Payment Number & Copy Button Row */}
          <div className="flex items-center justify-between gap-3 bg-[#130b18] p-3 rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] text-zinc-400 block font-medium">
                নিচের নম্বরে Send Money করুন:
              </span>
              <span className="font-mono text-base sm:text-xl font-bold tracking-wider text-pink-100 tabular-nums">
                {currentPayment.number}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                copiedSuccess
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-[#ff2a85] hover:bg-[#e01972] text-white shadow-[0_2px_12px_rgba(255,42,133,0.3)] active:scale-95'
              }`}
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
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

          {/* Clear Payment Instructions (Requirement 5) */}
          <div className="mt-3.5 pt-3 border-t border-white/10 space-y-1.5 text-xs text-zinc-300">
            <div className="font-semibold text-pink-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#ff2a85] shrink-0" />
              <span>পেমেন্ট নির্দেশনা:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] sm:text-xs text-[#d8b4d8] leading-relaxed">
              <li>উপলব্ধ পেমেন্ট মেথড (<strong className="text-white">{currentPayment.provider}</strong>) নির্বাচন করুন।</li>
              <li>উপরে প্রদর্শিত নম্বরের পাশে <strong className="text-white">Copy Number</strong> বাটনে ক্লিক করে নম্বর কপি করুন।</li>
              <li>আপনার <strong className="text-white">{currentPayment.provider}</strong> অ্যাপ ওপেন করুন।</li>
              <li><strong className="text-white">Send Money</strong> অপশন ব্যবহার করে একাউন্টের সঠিক মূল্য (<strong className="text-white">{account.price} ৳</strong>) পাঠান।</li>
              <li>লেনদেন সফল হলে প্রাপ্ত ট্রানজেকশন আইডি (TrxID) নিচের ফর্মে প্রদান করুন।</li>
              <li>সব তথ্য দিয়ে সাবমিট সম্পন্ন করুন (পেমেন্ট যাচাইয়ের পর এডমিন ডেলিভারি দিবেন)।</li>
            </ol>
          </div>
        </div>

        {/* ================= STEP 3: ORDER VERIFICATION FORM ================= */}
        <form onSubmit={handleSubmitOrder} className="space-y-3.5">
          <div className="text-xs font-bold text-pink-200">
            ৩. আপনার অর্ডারের তথ্য প্রদান করুন:
          </div>

          <div>
            <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
              আপনার নাম: <span className="text-[#ff2a85]">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="যেমন: তানভীর হাসান"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#ff2a85] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                যে নম্বর থেকে টাকা পাঠিয়েছেন: <span className="text-[#ff2a85]">*</span>
              </label>
              <input
                type="tel"
                required
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#ff2a85] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                TrxID (ট্রানজেকশন আইডি): <span className="text-[#ff2a85]">*</span>
              </label>
              <input
                type="text"
                required
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="যেমন: BL92KA87"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-zinc-500 text-sm uppercase tracking-wider font-mono focus:outline-none focus:border-[#ff2a85] transition-colors"
              />
            </div>
          </div>

          {/* Pending Status Transparency Note */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px] sm:text-xs">
              <strong className="text-white block">সতর্কতা ও স্ট্যাটাস:</strong>
              অর্ডার সাবমিট করলে এটি <strong>Pending</strong> থাকবে। এডমিন পেমেন্ট ভেরিফাই করার পর সরাসরি WhatsApp এ একাউন্ট ডেলিভারি সম্পন্ন করবেন।
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#ff2a85] hover:bg-[#e01972] shadow-[0_6px_22px_rgba(255,42,133,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{isSubmitting ? 'প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন & WhatsApp এ যান'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
