import React, { useState } from 'react';
import { Star, ShieldCheck, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  onSubmitReview: (review: Omit<Review, 'id' | 'approved'>) => void;
  onShowToast: (msg: string) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = React.memo(({
  reviews,
  onSubmitReview,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(6);

  const approvedReviews = reviews.filter((r) => r.approved);

  const displayedReviews = filterRating === 'all' 
    ? approvedReviews 
    : approvedReviews.filter(r => r.rating === filterRating);

  const visibleReviews = displayedReviews.slice(0, visibleCount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      onShowToast('দয়া করে আপনার নাম এবং মতামত লিখুন!');
      return;
    }

    onSubmitReview({
      name: name.trim(),
      text: comment.trim(),
      rating,
      date: 'এইমাত্র'
    });

    setName('');
    setComment('');
    setRating(5);
    onShowToast('ধন্যবাদ! আপনার রিভিউ জমা হয়েছে, এডমিন অনুমোদনের পর প্রদর্শিত হবে।');
  };

  return (
    <section id="reviews-section" className="scroll-mt-20 my-10">
      <div className="glass-panel p-5 sm:p-7 rounded-3xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff2a85]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a85] animate-pulse" />
              <span className="text-xs font-bold text-[#ff2a85] tracking-wider uppercase">
                গ্রাহক সন্তুষ্টি
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>কাস্টমার রিভিউ ও ফিডব্যাক</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[#d8b4d8] border border-white/10 tabular-nums">
                ({approvedReviews.length})
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-[#d8b4d8] mt-1">
              বাংলাদেশব্যাপী আমাদের হ্যাপি গ্রাহকদের বাস্তব অভিজ্ঞতা
            </p>
          </div>

          {/* Rating Score Card */}
          <div className="bg-black/50 border border-[#ff2a85]/30 p-3 sm:p-4 rounded-2xl flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="text-3xl font-black text-white tabular-nums">
              ৫.০
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <div className="text-[11px] text-[#d8b4d8] mt-0.5 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>১০০% ভেরিফায়েড ডিলস</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Grid / Feed */}
        {/* Reviews Grid / Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-6 max-h-[500px] overflow-y-auto pr-1">
          {visibleReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-[#ff2a85]/30 transition-all flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff2a85] to-purple-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,42,133,0.3)]">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{rev.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </h5>
                    {rev.date && (
                      <span className="text-[10px] text-zinc-400">{rev.date}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#d8b4d8] leading-relaxed">
                "{rev.text}"
              </p>
            </div>
          ))}
        </div>

        {/* Load More Reviews Toggle */}
        {displayedReviews.length > 6 && (
          <div className="text-center mb-6">
            <button
              onClick={() => setVisibleCount((prev) => prev >= displayedReviews.length ? 6 : prev + 6)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#ff2a85] border border-[#ff2a85]/30 hover:border-[#ff2a85] transition-all cursor-pointer active:scale-95"
            >
              {visibleCount >= displayedReviews.length 
                ? 'কম রিভিউ দেখুন' 
                : `আরও রিভিউ দেখুন (+${displayedReviews.length - visibleCount}টি)`
              }
            </button>
          </div>
        )}

        {/* Submit Review Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-[#ff2a85]" />
            <h4 className="font-bold text-sm sm:text-base text-white">
              আপনার অভিজ্ঞতা শেয়ার করুন
            </h4>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                  আপনার নাম:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: সাকিব হাসান"
                  className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#ff2a85]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                  রেটিং:
                </label>
                <div className="flex items-center gap-1 pt-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-amber-300 font-bold ml-2">
                    {rating} স্টার
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#d8b4d8] mb-1 font-medium">
                আপনার মতামত বা অভিজ্ঞতা:
              </label>
              <textarea
                required
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="যেমন: আইডি পাওয়ার পর সাথে সাথে লগইন করতে পেরেছি, খুবই ভালো সার্ভিস!"
                className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#ff2a85]"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white bg-[#ff2a85] hover:bg-[#e01972] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>রিভিউ পোস্ট করুন</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
});
