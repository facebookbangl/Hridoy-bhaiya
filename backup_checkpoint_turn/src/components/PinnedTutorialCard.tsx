import React, { useState } from 'react';
import { Pin, Play, Sparkles, X, ExternalLink, ArrowUpRight } from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface PinnedTutorialCardProps {
  whatsappNumber: string;
  onNavigateToIds: () => void;
}

export const PinnedTutorialCard: React.FC<PinnedTutorialCardProps> = ({
  whatsappNumber,
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const videoId = 'Q4htzNbAYzU';
  const videoUrl = 'https://youtu.be/Q4htzNbAYzU';
  const thumbnailUrl = 'https://i.ytimg.com/vi/Q4htzNbAYzU/hqdefault.jpg';

  return (
    <>
      {/* Sleek Compact Pinned Banner (Small Height & Non-intrusive) */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#1e072d]/90 via-[#290a3c]/85 to-[#130522]/90 backdrop-blur-xl border border-amber-400/35 hover:border-amber-400/60 p-2.5 sm:p-3 shadow-[0_6px_25px_rgba(245,158,11,0.15),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-10 w-36 h-20 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3.5">
          {/* Left: Thumbnail & Info Group */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Small Compact Thumbnail with Play button */}
            <div
              onClick={() => setIsVideoModalOpen(true)}
              className="relative w-24 sm:w-32 aspect-video rounded-xl overflow-hidden bg-black/60 shrink-0 cursor-pointer group shadow-md border border-white/10"
              title="ভিডিও প্লে করতে ক্লিক করুন"
            >
              <img
                src={thumbnailUrl}
                alt="ক্রয় বিক্রয় গাইড ভিডিও"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.8)] group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            {/* Text description */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-[10px] tracking-wide">
                  <Pin className="w-2.5 h-2.5 fill-current rotate-45" />
                  <span>পিন করা গাইড</span>
                </span>
                <span className="text-[10px] text-amber-200/80 hidden xs:inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>অফিসিয়াল টিউটোরিয়াল</span>
                </span>
              </div>

              <h3 
                onClick={() => setIsVideoModalOpen(true)}
                className="text-xs sm:text-sm font-bold text-white hover:text-amber-200 transition-colors truncate cursor-pointer"
              >
                কীভাবে ফ্রি ফায়ার আইডি কিনবেন ও বিক্রি করবেন?
              </h3>
              <p className="text-[11px] text-[#d8b4d8] truncate hidden xs:block">
                ১০০% নিরাপদে আইডি ক্রয় ও বিক্রয়ের সহজ নিয়ম ভিডিওতে দেখে নিন
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex-1 sm:flex-initial px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ভিডিও দেখুন</span>
            </button>

            <a
              href={formatWhatsAppUrl(
                whatsappNumber,
                'আসসালামু আলাইকুম ZERO POINT FF, আমি টিউটোরিয়াল ভিডিও দেখে আইডি বিক্রি করতে চাচ্ছি...'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title="আইডি বিক্রি করতে হোয়াটসঅ্যাপে যোগাযোগ করুন"
            >
              <span>আইডি বিক্রি</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Video Popup Modal (Opens when user clicks play or video button) */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#140620] border border-amber-400/40 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-400/20 text-amber-300">
                  <Pin className="w-3.5 h-3.5 rotate-45 fill-current" />
                </span>
                <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[240px] sm:max-w-md">
                  আইডি ক্রয়-বিক্রয়ের অফিসিয়াল ভিডিও গাইড
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors hidden sm:flex"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3 text-red-400" />
                </a>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Responsive 16:9 Video Embed */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="কীভাবে ফ্রি ফায়ার আইডি কিনবেন ও বিক্রি করবেন"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer with Action Buttons */}
            <div className="p-3 sm:p-4 bg-[#180827] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
              <p className="text-[#d8b4d8] text-[11px] sm:text-xs text-center sm:text-left">
                কোনো প্রশ্ন থাকলে সরাসরি হোয়াটসঅ্যাপে আমাদের এডমিনের সাথে কথা বলুন।
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={formatWhatsAppUrl(
                    whatsappNumber,
                    'আসসালামু আলাইকুম ZERO POINT FF, আমি ভিডিও গাইড দেখে যোগাযোগ করছি...'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-center shadow-sm"
                >
                  হোয়াটসঅ্যাপ সাপোর্ট
                </a>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 font-bold cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
