import React, { useState, useRef } from 'react';
import { 
  X, ShieldCheck, Flame, Sparkles, CheckCircle2, ShoppingBag, 
  Server, KeyRound, Share2, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Video as VideoIcon, Play, Maximize2, ExternalLink 
} from 'lucide-react';
import { Account } from '../types';
import { getYouTubeEmbedUrl } from '../utils/mediaStorage';

interface AccountDetailModalProps {
  account: Account | null;
  onClose: () => void;
  onBuy: (account: Account) => void;
  onShare: (account: Account) => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  account,
  onClose,
  onBuy,
  onShare,
}) => {
  if (!account) return null;

  // Compile full photo list (ensure fallback to account.image)
  const photos = account.images && account.images.length > 0 ? account.images : [account.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');

  // Touch Swipe tracking for mobile image slider
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 45;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Next image
      setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    } else if (isRightSwipe) {
      // Prev image
      setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const youtubeEmbedUrl = account.videoUrl ? getYouTubeEmbedUrl(account.videoUrl) : null;
  const isDirectVideo = account.videoUrl && !youtubeEmbedUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-3xl relative border border-[#ff2a85]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Controls */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          <button
            onClick={() => onShare(account)}
            className="p-2.5 rounded-full bg-black/75 hover:bg-black text-white/90 hover:text-[#ff2a85] transition-all cursor-pointer border border-white/20 shadow-lg active:scale-95"
            title="পোস্ট শেয়ার করুন"
            aria-label="Share Post"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/75 hover:bg-black text-zinc-300 hover:text-white transition-colors cursor-pointer border border-white/20 shadow-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Switcher Header (Photos vs Video) if video is present */}
        {account.videoUrl && (
          <div className="flex items-center gap-2 px-5 pt-4 pb-2 border-b border-white/10 bg-black/40">
            <button
              onClick={() => setActiveMediaTab('photos')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMediaTab === 'photos'
                  ? 'bg-[#ff2a85] text-white shadow-md'
                  : 'bg-white/5 text-[#d8b4d8] hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>ছবিসমূহ ({photos.length})</span>
            </button>

            <button
              onClick={() => setActiveMediaTab('video')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMediaTab === 'video'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white/5 text-[#d8b4d8] hover:text-white'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5 text-red-400" />
              <span>গেমপ্লে ভিডিও</span>
            </button>
          </div>
        )}

        {/* MAIN MEDIA DISPLAY AREA */}
        <div className="relative w-full bg-[#0c0610] overflow-hidden select-none">
          {activeMediaTab === 'photos' ? (
            /* ================= SWIPEABLE IMAGE SLIDER ================= */
            <div 
              className="relative w-full h-64 sm:h-96 flex items-center justify-center bg-black/60 touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Active Image */}
              <img
                key={photos[currentImageIndex]}
                src={photos[currentImageIndex]}
                alt={`${account.title} - ছবি ${currentImageIndex + 1}`}
                className="w-full h-full object-contain sm:object-cover transition-opacity duration-300"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Navigation Left / Right Buttons (Desktop & Tablet) */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Bottom Image Counter & Mobile Swipe Hint */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs pointer-events-none">
                <span className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-white border border-white/10 font-mono text-[11px] font-bold">
                  {currentImageIndex + 1} / {photos.length}
                </span>

                {photos.length > 1 && (
                  <span className="hidden sm:inline-block bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-zinc-300 border border-white/10 text-[10px]">
                    ← কীবোর্ড বা সোয়াইপ করুন →
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* ================= VIDEO PLAYER EMBED ================= */
            <div className="relative w-full aspect-video max-h-96 bg-black flex items-center justify-center">
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  title="Free Fire Account Gameplay Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : isDirectVideo ? (
                <video
                  src={account.videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                >
                  আপনার ব্রাউজারে ভিডিও প্লেয়ার সাপোর্ট করছে না।
                </video>
              ) : (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  ভিডিও লোড করা যায়নি।
                </div>
              )}
            </div>
          )}

          {/* Bottom Thumbnails Strip for 1-Tap Switching (If more than 1 image) */}
          {activeMediaTab === 'photos' && photos.length > 1 && (
            <div className="p-2.5 bg-black/70 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
              {photos.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    currentImageIndex === idx
                      ? 'border-[#ff2a85] shadow-[0_0_12px_rgba(255,42,133,0.5)] scale-105'
                      : 'border-white/15 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] text-white px-1 font-mono">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS BODY CONTENT */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Title & Price */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#ff2a85] text-white text-xs font-black px-2.5 py-1 rounded tracking-widest shadow-md">
                  {account.code}
                </span>
                {account.sold ? (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    SOLD OUT
                  </span>
                ) : (
                  <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>উপলব্ধ</span>
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 leading-snug">
                {account.title}
              </h3>
            </div>

            <div className="bg-black/60 border border-[#ff2a85]/30 p-3 rounded-2xl shrink-0 self-start sm:self-auto text-right">
              <span className="text-[10px] text-zinc-400 block">মূল্য (Send Money)</span>
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {account.price.toLocaleString('bn-BD')}
                <span className="text-base font-bold text-[#ff2a85] ml-0.5">৳</span>
              </span>
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
              <span className="text-[11px] text-[#d8b4d8] block">লেভেল</span>
              <span className="text-lg font-black text-white">{account.level}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#ff2a85]/10 border border-[#ff2a85]/20 text-center">
              <span className="text-[11px] text-pink-200 block flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#ff2a85]" /> ইভো গান
              </span>
              <span className="text-lg font-black text-[#ff2a85]">{account.evo} টি</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-center">
              <span className="text-[11px] text-purple-200 block flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> ইমোটস
              </span>
              <span className="text-lg font-black text-purple-200">{account.emotes} টি</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
              <span className="text-[11px] text-[#d8b4d8] block flex items-center justify-center gap-1">
                <Server className="w-3.5 h-3.5 text-cyan-400" /> সার্ভার
              </span>
              <span className="text-xs font-bold text-white truncate block">{account.server || 'BD/South Asia'}</span>
            </div>
          </div>

          {/* Description & Account Perks */}
          {account.description && (
            <div className="p-4 rounded-xl bg-black/30 border border-white/10">
              <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#ff2a85]" />
                <span>আইডির বিশেষত্ব ও কালেকশন বিবরণ:</span>
              </h4>
              <p className="text-sm text-[#d8b4d8] leading-relaxed">
                {account.description}
              </p>
            </div>
          )}

          {/* Guarantee / Safe Transfer Box */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1.5 text-xs">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>জিরো পয়েন্ট এফএফ ১০০% সিকিউর ট্রান্সফার গ্যারান্টি:</span>
            </div>
            <ul className="text-zinc-300 space-y-1 list-disc list-inside text-[11px] sm:text-xs">
              <li>আইডির সম্পূর্ণ এক্সেস ও পাসওয়ার্ড ক্রেতার নিজস্ব ফোন নম্বর/রিকভারিতে সেট করে দেওয়া হয়।</li>
              <li>পেমেন্ট কনফার্মেশনের পর ৫ মিনিটের ভেতর সরাসরি WhatsApp এ ডেলিভারি।</li>
            </ul>
          </div>

          {/* Action Footer with Share & Buy */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onShare(account)}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10 active:scale-95"
                title="বন্ধুদের সাথে শেয়ার করুন"
              >
                <Share2 className="w-4 h-4 text-[#ff2a85]" />
                <span>শেয়ার করুন</span>
              </button>

              <button
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onBuy(account);
              }}
              disabled={account.sold}
              className={`flex-1 sm:flex-initial min-w-[180px] py-3 px-5 rounded-xl font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 ${
                account.sold
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-[#ff2a85] hover:bg-[#e01972] shadow-[0_4px_20px_rgba(255,42,133,0.4)] active:scale-98 animate-pulse-subtle'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{account.sold ? 'ইতিমধ্যে বিক্রি হয়ে গেছে' : 'এখনই কিনুন (Buy Now)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
