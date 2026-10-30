import React from 'react';
import { ExternalLink, Flame, Sparkles } from 'lucide-react';

export const YOUTUBE_URL = 'https://youtube.com/@freefireidbuyandsellbangladesh?si=kdpGdfjCvR3IWODk';
export const TELEGRAM_URL = 'https://t.me/FFIDSELLBD_HRIDOY';

export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.716-.962 4.084-1.362 5.823-.169.736-.44 0.982-.702 1.006-.57.053-1.002-.376-1.554-.738-.863-.566-1.351-.918-2.186-1.468-.966-.636-.34-.986.211-1.556.144-.149 2.651-2.428 2.7-2.636.006-.026.012-.124-.047-.176-.059-.052-.146-.034-.209-.02-.089.02-1.507.959-4.253 2.812-.402.277-.766.412-1.092.405-.36-.008-1.052-.204-1.566-.371-.631-.205-1.133-.313-1.089-.661.023-.181.273-.367.751-.557 2.946-1.284 4.912-2.131 5.899-2.542 2.808-1.168 3.393-1.371 3.774-1.378.084-.001.271.02.392.119.102.083.131.196.144.275.013.078.028.257.016.398z" />
  </svg>
);

export const SocialMediaSection: React.FC = () => {
  return (
    <section id="social-media-section" className="mt-14 sm:mt-18" aria-labelledby="social-media-heading">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-[#ff2a85] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>অফিসিয়াল কমিউনিটি</span>
        </div>
        <h2 
          id="social-media-heading"
          className="text-2xl sm:text-3xl font-extrabold text-white"
        >
          আমাদের সোশ্যাল মিডিয়া
        </h2>
        <p className="text-xs sm:text-sm text-[#d8b4d8] max-w-xl mx-auto leading-relaxed">
          ফ্রি ফায়ার আইডির ফুল রিভিউ ভিডিও দেখতে এবং নতুন আইডি ড্রপের ইনস্ট্যান্ট আপডেট সবার আগে পেতে আমাদের সাথে যুক্ত থাকুন।
        </p>
      </div>

      {/* Social Cards Grid */}
      {/* Social Cards Grid in Frosted Glass */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {/* YouTube Card */}
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ZERO POINT FF অফিসিয়াল YouTube চ্যানেল পরিদর্শন করুন"
          className="group relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-[#1a0a14]/65 backdrop-blur-xl border border-red-500/30 hover:border-[#FF0000] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_40px_rgba(255,0,0,0.35)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 cursor-pointer"
        >
          {/* Subtle Red Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FF0000]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FF0000]/25 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF0000]/15 border border-[#FF0000]/40 flex items-center justify-center text-[#FF0000] shadow-[0_0_15px_rgba(255,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:bg-[#FF0000] group-hover:text-white transition-all duration-300">
                  <YouTubeIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-red-400 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    YouTube Channel
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-red-200 transition-colors">
                    FREE FIRE ID BUY & SELL BANGLADESH
                  </h3>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full glass-button flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-red-500/40 transition-all">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              আইডির কালেকশন ভিডিও, ইভো গান লেভেল, ইমোটস ও দামের পূর্ণাঙ্গ রিভিউ সরাসরি আমাদের ইউটিউব চ্যানেলে দেখুন।
            </p>

            <ul className="text-[11px] text-[#d8b4d8] space-y-1.5 mb-5 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✓</span>
                <span>প্রতিটি আইডির ফুল গেমপ্লে ও কালেকশন ভিডিও</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✓</span>
                <span>১০০% নিরাপদ ও ভেরিফায়েড আইডি ড্রপস</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FF0000] to-[#cc0000] hover:from-[#ff1a1a] hover:to-[#b30000] shadow-[0_4px_16px_rgba(255,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 transition-all">
            <YouTubeIcon className="w-4 h-4" />
            <span>ইউটিউব চ্যানেলে যান ও সাবস্ক্রাইব করুন</span>
          </div>
        </a>

        {/* Telegram Card */}
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ZERO POINT FF অফিসিয়াল Telegram চ্যানেল জয়েন করুন"
          className="group relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-[#081522]/65 backdrop-blur-xl border border-[#229ED9]/30 hover:border-[#229ED9] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_40px_rgba(34,158,217,0.35)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 cursor-pointer"
        >
          {/* Subtle Cyan/Blue Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#229ED9]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#229ED9]/25 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#229ED9]/15 border border-[#229ED9]/40 flex items-center justify-center text-[#229ED9] shadow-[0_0_15px_rgba(34,158,217,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:bg-[#229ED9] group-hover:text-white transition-all duration-300">
                  <TelegramIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    Telegram Channel
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-sky-200 transition-colors">
                    FFIDSELLBD_HRIDOY
                  </h3>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full glass-button flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-sky-500/40 transition-all">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              নতুন আইডি ড্রপ, ফ্ল্যাশ ডিল, ডিসকাউন্ট অফার ও লাইভ পেমেন্ট প্রুফ সবার আগে আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে দেওয়া হয়।
            </p>

            <ul className="text-[11px] text-[#d8b4d8] space-y-1.5 mb-5 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-sky-400 font-bold">✓</span>
                <span>সবার আগে নতুন আইডি স্টক ও প্রাইস নোটিফিকেশন</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-400 font-bold">✓</span>
                <span>সরাসরি অ্যাডমিন ডিল ও গ্রাহক ট্রাস্ট প্রুফ</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#0088cc] to-[#006ea6] hover:from-[#0099e6] hover:to-[#0077b5] shadow-[0_4px_16px_rgba(0,136,204,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 transition-all">
            <TelegramIcon className="w-4 h-4" />
            <span>টেলিগ্রাম চ্যানেলে জয়েন করুন</span>
          </div>
        </a>
      </div>
    </section>
  );
};
