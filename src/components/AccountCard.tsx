import React from 'react';
import { Eye, Shield, Flame, Sparkles, CheckCircle2, Share2, Image as ImageIcon, Video } from 'lucide-react';
import { Account } from '../types';

interface AccountCardProps {
  account: Account;
  onBuy: (account: Account) => void;
  onViewDetails: (account: Account) => void;
  onShare: (account: Account) => void;
}

export const AccountCard: React.FC<AccountCardProps> = React.memo(({
  account,
  onBuy,
  onViewDetails,
  onShare,
}) => {
  const imageCount = account.images?.length || 1;
  const hasVideo = Boolean(account.videoUrl);

  return (
    <div className={`account-card-container glass-panel rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative group ${
      account.sold 
        ? 'opacity-85 border-zinc-800' 
        : 'hover:border-[#ff2a85]/60 hover:shadow-[0_12px_32px_rgba(255,42,133,0.22)] hover:-translate-y-1'
    }`}>
      {/* Thumbnail Area */}
      <div className="relative w-full h-48 sm:h-52 bg-[#181120] overflow-hidden">
        <img
          src={account.image}
          alt={account.title}
          loading="lazy"
          decoding="async"
          width="400"
          height="220"
          className={`w-full h-full object-cover transition-transform duration-500 ${
            account.sold ? 'grayscale-40 brightness-75' : 'group-hover:scale-105'
          }`}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140c19] via-black/25 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="bg-black/75 backdrop-blur-md border border-[#ff2a85]/50 text-[#ff2a85] text-xs font-bold px-2.5 py-1 rounded-md tracking-wider">
            {account.code}
          </span>

          <div className="flex items-center gap-1.5">
            {account.sold ? (
              <span className="bg-red-600/90 backdrop-blur-md text-white text-xs font-black px-2.5 py-1 rounded-md shadow-[0_0_12px_rgba(239,68,68,0.7)] flex items-center gap-1">
                <span>SOLD OUT</span>
              </span>
            ) : (
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.5)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>উপলব্ধ</span>
              </span>
            )}
          </div>
        </div>

        {/* Media indicator badges (Photos count & Video indicator) */}
        <div className="absolute top-11 left-3 flex flex-wrap gap-1 pointer-events-none">
          {imageCount > 1 && (
            <span className="bg-black/70 backdrop-blur-md text-zinc-200 border border-white/10 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-[#ff2a85]" />
              <span>{imageCount} ছবি</span>
            </span>
          )}
          {hasVideo && (
            <span className="bg-red-950/80 backdrop-blur-md text-red-200 border border-red-500/40 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <Video className="w-3 h-3 text-red-400" />
              <span>ভিডিও</span>
            </span>
          )}
        </div>

        {/* Top Right Quick Actions (Share & View) */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={() => onShare(account)}
            className="p-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white/90 hover:text-[#ff2a85] hover:border-[#ff2a85] transition-all cursor-pointer shadow-md active:scale-90"
            title="পোস্ট শেয়ার করুন"
            aria-label="Share Post"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewDetails(account)}
            className="p-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white/90 hover:text-white hover:border-[#ff2a85] transition-all cursor-pointer shadow-md active:scale-90"
            title="ডিটেইলস ও ছবি বড় করে দেখুন"
            aria-label="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {account.loginMethod && (
          <div className="absolute bottom-2.5 left-2.5 text-[11px] font-medium px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[#d8b4d8] border border-white/10 flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>{account.loginMethod}</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h4 
            className="font-bold text-white text-base sm:text-lg leading-snug line-clamp-2 hover:text-[#ff2a85] transition-colors cursor-pointer" 
            onClick={() => onViewDetails(account)}
          >
            {account.title}
          </h4>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs text-[#d8b4d8] flex items-center gap-1">
              <span>Level:</span>
              <strong className="text-white font-bold tabular-nums">{account.level}</strong>
            </div>

            <div className="bg-[#ff2a85]/10 border border-[#ff2a85]/20 px-2.5 py-1 rounded-md text-xs text-pink-200 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#ff2a85]" />
              <span>Evo:</span>
              <strong className="text-white font-bold tabular-nums">{account.evo}</strong>
            </div>

            <div className="bg-purple-950/40 border border-purple-500/20 px-2.5 py-1 rounded-md text-xs text-purple-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Emotes:</span>
              <strong className="text-white font-bold tabular-nums">{account.emotes}</strong>
            </div>
          </div>
        </div>

        {/* Card Footer with Price, Share, Details, and Buy Button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="text-[11px] text-[#d8b4d8]">মূল্য</div>
            <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-0.5 tabular-nums">
              {account.price.toLocaleString('bn-BD')}
              <span className="text-sm font-bold text-[#ff2a85]">৳</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onShare(account)}
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-[#ff2a85] border border-white/10 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
              title="শেয়ার করুন"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">শেয়ার</span>
            </button>

            <button
              onClick={() => onViewDetails(account)}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              বিস্তারিত
            </button>

            <button
              onClick={() => onBuy(account)}
              disabled={account.sold}
              className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                account.sold
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-[#ff2a85] hover:bg-[#e01972] text-white shadow-[0_4px_16px_rgba(255,42,133,0.4)] active:scale-95 animate-pulse-subtle'
              }`}
            >
              {account.sold ? 'বিক্রি শেষ' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
