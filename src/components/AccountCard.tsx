import React, { useState } from 'react';
import { 
  Shield, Flame, Sparkles, CheckCircle2, Share2, 
  Image as ImageIcon, Video, Play, X, ExternalLink 
} from 'lucide-react';
import { Account } from '../types';
import { extractYouTubeId } from '../utils/mediaStorage';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const imageCount = account.images?.length || 1;
  const hasVideo = Boolean(account.videoUrl);
  const ytId = account.videoUrl ? extractYouTubeId(account.videoUrl) : null;

  return (
    <div className={`account-card-container glass-panel rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative group ${
      account.sold 
        ? 'opacity-85 border-zinc-800' 
        : 'hover:border-[#ff2a85]/60 hover:shadow-[0_12px_32px_rgba(255,42,133,0.22)] hover:-translate-y-1'
    }`}>
      {/* Media / Thumbnail Area (16:9 Aspect Ratio) */}
      {isPlaying && ytId ? (
        <div className="relative w-full aspect-video bg-black overflow-hidden">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            title={account.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          {/* In-player top controls */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
            <a
              href={`https://youtu.be/${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white/90 hover:text-white border border-white/20 transition-all text-xs flex items-center gap-1 shadow-md"
              title="YouTube-এ দেখুন"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-400" />
            </a>
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-red-600 text-white transition-all border border-white/20 cursor-pointer shadow-md"
              title="ভিডিও বন্ধ করুন"
              aria-label="ভিডিও বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="relative w-full aspect-video bg-[#181120] overflow-hidden group/thumb cursor-pointer"
          onClick={() => onViewDetails(account)}
        >
          <img
            src={account.image}
            alt={account.title}
            loading="lazy"
            decoding="async"
            width="480"
            height="270"
            className={`w-full h-full object-cover transition-transform duration-500 ${
              account.sold ? 'grayscale-40 brightness-75' : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (ytId && !target.src.includes('hqdefault.jpg')) {
                target.src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
              }
            }}
          />

          {/* YouTube-Style Play Button in Center */}
          {ytId && !account.sold && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(true);
              }}
              className="absolute inset-0 m-auto w-12 h-9 sm:w-14 sm:h-10 rounded-xl bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.7)] hover:shadow-[0_0_28px_rgba(239,68,68,0.95)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer z-10 border border-white/20"
              aria-label="ভিডিও চালু করুন"
              title="ভিডিও চালু করুন"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5" />
              <span className="sr-only">Play Video</span>
            </button>
          )}

          {account.sold && (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-red-600 text-white text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.8)] tracking-wider">
                SOLD OUT
              </span>
            </div>
          )}
        </div>
      )}

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Clean Meta Row (Code, Media Count, Login Method & Status) - Moved here so thumbnail is 100% clear */}
          <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-[#ff2a85]/15 border border-[#ff2a85]/40 text-[#ff2a85] text-xs font-bold px-2 py-0.5 rounded tracking-wide">
                {account.code}
              </span>

              {account.loginMethod && (
                <span className="bg-white/5 border border-white/10 text-[#d8b4d8] text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  <span>{account.loginMethod}</span>
                </span>
              )}

              {imageCount > 1 && (
                <span className="bg-white/5 text-zinc-300 border border-white/10 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#ff2a85]" />
                  <span>{imageCount} ছবি</span>
                </span>
              )}

              {hasVideo && (
                <span className="bg-red-950/40 text-red-300 border border-red-500/30 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Video className="w-3 h-3 text-red-400" />
                  <span>ভিডিও</span>
                </span>
              )}
            </div>

            <div>
              {account.sold ? (
                <span className="bg-red-600/90 text-white text-[11px] font-black px-2 py-0.5 rounded">
                  SOLD
                </span>
              ) : (
                <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>উপলব্ধ</span>
                </span>
              )}
            </div>
          </div>

          <h4 
            className="font-bold text-white text-base sm:text-lg leading-snug line-clamp-2 hover:text-[#ff2a85] transition-colors cursor-pointer" 
            onClick={() => onViewDetails(account)}
            title={account.title}
          >
            {account.title}
          </h4>

          {/* Clean metadata row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#d8b4d8] mt-2.5">
            <span className="flex items-center gap-1 font-semibold text-white">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>লেভেল {account.level}</span>
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 font-semibold text-pink-200">
              <Flame className="w-3.5 h-3.5 text-[#ff2a85]" />
              <span>{account.evo} ইভো গান</span>
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 font-semibold text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{account.emotes} ইমোট</span>
            </span>
          </div>
        </div>

        {/* Card Footer with Price, Share, Details, and Buy Button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
          <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-1 tabular-nums">
            <span>{account.price.toLocaleString('bn-BD')}</span>
            <span className="text-sm font-bold text-[#ff2a85]">৳</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onShare(account)}
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-[#ff2a85] border border-white/10 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
              title="শেয়ার করুন"
              aria-label="শেয়ার করুন"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">শেয়ার</span>
            </button>

            <button
              type="button"
              onClick={() => onViewDetails(account)}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              বিস্তারিত
            </button>

            <button
              type="button"
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
