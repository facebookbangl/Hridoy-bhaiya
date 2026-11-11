import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Flame, Sparkles, CheckCircle2, Share2, 
  Image as ImageIcon, Video, Play, X, ExternalLink 
} from 'lucide-react';
import { Account } from '../types';
import { extractYouTubeId } from '../utils/mediaStorage';
import { OptimizedVideoPlayer } from './OptimizedVideoPlayer';

interface AccountCardProps {
  account: Account;
  index?: number;
  onBuy: (account: Account) => void;
  onViewDetails: (account: Account) => void;
  onShare: (account: Account) => void;
}

export const AccountCard: React.FC<AccountCardProps> = React.memo(({
  account,
  index = 0,
  onBuy,
  onViewDetails,
  onShare,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasSettled, setHasSettled] = useState(false);

  const imageCount = account.images?.length || 1;
  const hasVideo = Boolean(account.videoUrl);
  const ytId = account.videoUrl ? extractYouTubeId(account.videoUrl) : null;
  const isDirectVideo = Boolean(account.videoUrl && (account.videoType === 'direct' || account.videoUrl.endsWith('.mp4') || account.videoUrl.includes('.mp4')));

  // Alternating entrance direction:
  // 1st card (0): Left, 2nd card (1): Right, 3rd card (2): Left, 4th card (3): Right...
  const isFromLeft = index % 2 === 0;

  useEffect(() => {
    // Respect user's reduced-motion preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      setHasSettled(true);
      return;
    }

    const node = cardRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      setHasSettled(true);
      return;
    }

    // Failsafe timer: Guarantee visibility within 1000ms even if IntersectionObserver fails or delays in mobile in-app browsers
    const failsafe = setTimeout(() => {
      setIsVisible(true);
      setHasSettled(true);
    }, 1000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
          clearTimeout(failsafe);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '40px 0px',
      }
    );

    observer.observe(node);

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible || hasSettled) return;

    // Small staggered delay between cards so they enter one after another
    const staggerDelayMs = (index % 6) * 90;
    const animationDurationMs = 650;
    const timer = setTimeout(() => {
      setHasSettled(true);
    }, staggerDelayMs + animationDurationMs + 50);

    return () => clearTimeout(timer);
  }, [isVisible, hasSettled, index]);

  // Alternating smooth translateX, opacity and subtle scale animation
  const flyInStyle: React.CSSProperties = hasSettled
    ? {}
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translate3d(0, 0, 0) scale(1)'
          : `translate3d(${isFromLeft ? '-50px' : '50px'}, 0, 0) scale(0.96)`,
        transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: isVisible ? `${(index % 6) * 90}ms` : '0ms',
        willChange: isVisible ? 'auto' : 'transform, opacity',
      };

  const isPending = account.status === 'pending';
  const isSold = account.sold || account.status === 'sold';

  return (
    <div 
      ref={cardRef}
      style={flyInStyle}
      className={`account-card-container glass-panel rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative group ${
        isSold 
          ? 'opacity-85 border-zinc-800' 
          : isPending
          ? 'border-amber-500/40 hover:border-amber-500/70 hover:shadow-[0_12px_32px_rgba(245,158,11,0.2)]'
          : 'hover:border-[#ff2a85]/60 hover:shadow-[0_12px_32px_rgba(255,42,133,0.22)] hover:-translate-y-1'
      }`}>
      {/* Media / Thumbnail Area (16:9 Aspect Ratio) with Lazy & Optimized Player */}
      {hasVideo && !isSold && !isPending ? (
        <OptimizedVideoPlayer
          id={`card-${account.id}`}
          videoUrl={account.videoUrl!}
          posterUrl={account.image}
          title={account.title}
          aspectRatio="video"
          showCloseButton={true}
        />
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
              isSold ? 'grayscale-40 brightness-75' : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null; // Prevent infinite error loops
              if (ytId && !target.src.includes('hqdefault.jpg')) {
                target.src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
              } else {
                target.src = '/zero_point_logo.png';
              }
            }}
          />

          {isSold ? (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-red-600 text-white text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.8)] tracking-wider">
                SOLD OUT
              </span>
            </div>
          ) : isPending ? (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-amber-500 text-black text-xs sm:text-sm font-black px-3 py-1 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.8)] tracking-wider">
                PENDING DEAL
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Clean Meta Row (Code, Media Count, Login Method & Status) - Moved here so thumbnail is 100% clear */}
          <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="glass-badge-pink text-[#ff2a85] text-xs font-bold px-2 py-0.5 rounded tracking-wide">
                {account.code}
              </span>

              {account.loginMethod && (
                <span className="glass-pill text-[#d8b4d8] text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  <span>{account.loginMethod}</span>
                </span>
              )}

              {imageCount > 1 && (
                <span className="glass-pill text-zinc-300 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#ff2a85]" />
                  <span>{imageCount} ছবি</span>
                </span>
              )}

              {hasVideo && (
                <span className="bg-red-950/40 text-red-300 border border-red-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-sm text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Video className="w-3 h-3 text-red-400" />
                  <span>ভিডিও</span>
                </span>
              )}
            </div>

            <div>
              {isSold ? (
                <span className="bg-red-600/90 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm">
                  SOLD
                </span>
              ) : isPending ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                  পেন্ডিং ডিল
                </span>
              ) : (
                <span className="glass-badge-emerald text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
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
          <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-1 tabular-nums drop-shadow-sm">
            <span>{account.price.toLocaleString('bn-BD')}</span>
            <span className="text-sm font-bold text-[#ff2a85]">৳</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onShare(account)}
              className="glass-button p-2 sm:px-2.5 sm:py-2 text-xs font-semibold rounded-xl text-white/80 hover:text-[#ff2a85] cursor-pointer flex items-center gap-1 active:scale-95"
              title="শেয়ার করুন"
              aria-label="শেয়ার করুন"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">শেয়ার</span>
            </button>

            <button
              type="button"
              onClick={() => onViewDetails(account)}
              className="glass-button px-2.5 py-2 text-xs font-semibold rounded-xl text-white/85 hover:text-white cursor-pointer active:scale-95"
            >
              বিস্তারিত
            </button>

            <button
              type="button"
              onClick={() => onBuy(account)}
              disabled={isSold || isPending}
              className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                isSold
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : isPending
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#ff2a85] to-[#ff1a53] hover:from-[#e01972] hover:to-[#e60f44] text-white shadow-[0_4px_20px_rgba(255,42,133,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 animate-pulse-subtle'
              }`}
            >
              {isSold ? 'বিক্রি শেষ' : isPending ? 'ডিল চলছে' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
