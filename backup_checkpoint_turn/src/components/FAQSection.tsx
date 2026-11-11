import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Zap, Lock, Headphones, RefreshCw } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'পেমেন্ট করার পর কিভাবে একাউন্টের এক্সেস বুঝিয়ে দেওয়া হবে?',
      answer: 'পেমেন্ট সফল হওয়ার সাথে সাথে আপনার অর্ডার ও TrxID আমাদের সিস্টেমে যুক্ত হয়। এরপর এডমিন ভাই সরাসরি WhatsApp-এ আপনার সাথে যোগাযোগ করবেন এবং ৫ থেকে ১০ মিনিটের মধ্যে জিমেইল/ফেসবুক আইডির সম্পূর্ণ এক্সেস ও পাসওয়ার্ড আপনার নিজস্ব ফোন নম্বর ও রিকভারিতে সেট করে বুঝিয়ে দেবেন।',
      icon: <Zap className="w-4 h-4 text-amber-400" />
    },
    {
      question: 'একাউন্ট কি ১০০% নিরাপদ এবং টু-স্টেপ ভেরিফিকেশন (2FA) পরিবর্তন করা যাবে?',
      answer: 'হ্যাঁ, আলহামদুলিল্লাহ! ZERO POINT FF-এর প্রতিটি আইডি ১০০% ফ্রেশ এবং নিরাপদ। হ্যান্ডওভারের সময় ক্রেতার নিজস্ব মোবাইল নম্বরে টু-স্টেপ ভেরিফিকেশন ও পাসওয়ার্ড পরিবর্তন করে ফুল সিকিউর নিশ্চিত করা হয়। পুরনো মালিকের কোনো এক্সেস থাকে না।',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
    },
    {
      question: 'পেমেন্ট কোন কোন মাধ্যমে এবং কীভাবে পরিশোধ করতে হবে?',
      answer: 'পেমেন্ট শুধুমাত্র bKash এবং Nagad-এর অফিসিয়াল পার্সোনাল নম্বরে "Send Money" এর মাধ্যমে গ্রহণ করা হয়। প্রদর্শিত নম্বর কপি করে আপনার বিকাশ/নগদ অ্যাপ থেকে টাকা পাঠিয়ে প্রাপ্ত TrxID ফর্মে সাবমিট করবেন। কোনো গোপন চার্জ নেই।',
      icon: <Lock className="w-4 h-4 text-[#ff2a85]" />
    },
    {
      question: 'একাউন্ট কেনার পর কি কোনো সমস্যা হলে সাপোর্ট পাওয়া যাবে?',
      answer: 'অবশ্যই! আমাদের ডেডিকেটেড WhatsApp হেল্পলাইন (01722782496) ২৪/৭ এক্টিভ থাকে। আইডি লগইন, সেটিং চেঞ্জ বা যেকোনো টেকনিক্যাল সমস্যায় আমাদের এডমিন টিম সবসময় দ্রুত সমাধান প্রদান করে।',
      icon: <Headphones className="w-4 h-4 text-cyan-400" />
    },
    {
      question: 'আইডি কেনার পূর্বে কি ভিডিও ও ইনভেন্টরি দেখে নেওয়া যায়?',
      answer: 'হ্যাঁ! প্রতিটি আইডির কার্ডে "প্লে ভিডিও" বাটন রয়েছে, যেখান থেকে সরাসরি ফুল ইনভেন্টরি, গান স্কিন, ইভো গান ম্যাক্স এবং বান্ডেল কালেকশনের ভিডিও দেখে ১০০% নিশ্চিত হয়ে অর্ডার করতে পারবেন।',
      icon: <RefreshCw className="w-4 h-4 text-purple-400" />
    }
  ];

  return (
    <section id="faq-section" className="scroll-mt-20">
      <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/10 space-y-5">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl glass-badge-pink flex items-center justify-center text-[#ff2a85]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>সাধারণ প্রশ্নোত্তর (FAQ)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-pink-300">
                  নিরাপদ ক্রয় গাইড
                </span>
              </h3>
              <p className="text-xs text-[#d8b4d8] mt-0.5">
                আইডি কেনাবেচা সংক্রান্ত সাধারণ প্রশ্ন ও নির্ভরযোগ্য সমাধান
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl transition-all duration-300 border ${
                  isOpen
                    ? 'bg-black/50 border-[#ff2a85]/40 shadow-[0_4px_20px_rgba(255,42,133,0.12)]'
                    : 'bg-black/25 border-white/5 hover:border-white/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 shrink-0">
                      {faq.icon}
                    </div>
                    <span className="text-sm sm:text-base font-bold text-white leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#d8b4d8] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#ff2a85]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-1 text-xs sm:text-sm text-[#d8b4d8] leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
