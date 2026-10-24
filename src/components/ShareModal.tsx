import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Facebook, Send, Twitter } from 'lucide-react';
import { Account } from '../types';

interface ShareModalProps {
  account: Account | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  account,
  onClose,
  onShowToast,
}) => {
  if (!account) return null;

  const [copied, setCopied] = useState(false);

  // Generate deep link
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const shareUrl = `${currentUrl}#id=${account.code}`;

  const shareText = `🔥 ZERO POINT FF - ফ্রি ফায়ার আইডি ডিল!
🆔 আইডি কোড: ${account.code}
⭐ লেভেল: ${account.level} · ইভো গান: ${account.evo}টি · ইমোটস: ${account.emotes}টি
💰 মূল্য: ${account.price} ৳ (Send Money)
১০০% ট্রাস্টেড ও নিরাপদ ডেলিভারি। এখনই দেখুন:`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    onShowToast('পোস্ট লিংক কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(waUrl, '_blank');
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank');
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-md rounded-2xl p-5 sm:p-6 relative border border-[#ff2a85]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#ff2a85]/20 border border-[#ff2a85]/40 flex items-center justify-center text-[#ff2a85]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">পোস্ট শেয়ার করুন</h3>
            <p className="text-xs text-[#d8b4d8]">বন্ধুদের সাথে ফ্রি ফায়ার আইডির বিস্তারিত শেয়ার করুন</p>
          </div>
        </div>

        {/* Account Quick Preview */}
        <div className="p-3 rounded-xl bg-black/50 border border-white/10 mb-4 flex items-center gap-3">
          <img
            src={account.image}
            alt={account.title}
            className="w-12 h-12 rounded-lg object-cover border border-[#ff2a85]/40 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#ff2a85] font-mono">{account.code}</span>
            <h4 className="text-xs font-semibold text-white truncate">{account.title}</h4>
            <div className="text-[11px] text-zinc-300 font-bold tabular-nums">
              {account.price} ৳ · লেভেল {account.level}
            </div>
          </div>
        </div>

        {/* 1-Tap Copy Link Bar */}
        <div className="mb-4">
          <label className="block text-xs text-[#d8b4d8] mb-1.5 font-medium">
            সরাসরি পোস্ট লিংক:
          </label>
          <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-zinc-300 font-mono flex-1 outline-none truncate px-1"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-[#ff2a85] hover:bg-[#e01972] text-white shadow-[0_2px_10px_rgba(255,42,133,0.3)]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি লিংক</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div>
          <span className="block text-xs text-[#d8b4d8] mb-2 font-medium">
            সোশ্যাল মিডিয়ায় শেয়ার করুন:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 text-emerald-200 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </button>

            <button
              onClick={handleShareFacebook}
              className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 hover:bg-blue-900/50 text-blue-200 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Facebook className="w-5 h-5 text-blue-400" />
              <span className="text-[11px] font-semibold">Facebook</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 hover:bg-sky-900/50 text-sky-200 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Send className="w-5 h-5 text-sky-400" />
              <span className="text-[11px] font-semibold">Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
