import React from 'react';
import { CheckCircle2, ShieldAlert, Zap, Clock, Lock, Sparkles } from 'lucide-react';

export const RulesSection: React.FC = () => {
  const steps = [
    {
      step: '১',
      title: 'পছন্দের আইডি সিলেক্ট করুন',
      desc: 'উপরে থাকা আইডিসমূহের মধ্য থেকে আপনার বাজেট ও পছন্দের গান স্কিন অনুযায়ী আইডি নির্বাচন করুন।'
    },
    {
      step: '২',
      title: 'Send Money করুন',
      desc: 'আমাদের অফিসিয়াল বিকাশ, নগদ বা রকেট নম্বরে নির্ধারিত মূল্য সেন্ড মানি করুন (শুধুমাত্র পার্সোনাল সেন্ড মানি)।'
    },
    {
      step: '৩',
      title: 'TrxID দিয়ে কনফার্ম করুন',
      desc: 'অর্ডার ফর্মে আপনার নাম, প্রেরক নম্বর ও TrxID লিখে "কনফার্ম করুন" বাটনে চাপুন।'
    },
    {
      step: '৪',
      title: 'WhatsApp এ একাউন্ট বুঝে নিন',
      desc: 'কনফার্ম করার সাথে সাথে স্বয়ংক্রিয় মেসেজ সহ হোয়াটসঅ্যাপ ওপেন হবে। এডমিন ৫ মিনিটের ভেতর আইডি হস্তান্তর করবেন।'
    }
  ];

  return (
    <section id="rules-section" className="scroll-mt-20 my-10">
      <div className="glass-panel p-5 sm:p-7 rounded-3xl relative overflow-hidden">
        <div className="flex items-center gap-1.5 mb-1.5 text-[#ff2a85]">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold">
            সহজ ও নিরাপদ কেনাকাটা
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
          আইডি কেনার সহজ ৪টি ধাপ
        </h3>
        <p className="text-xs sm:text-sm text-[#d8b4d8] mb-6">
          কোনো প্রকার প্রতারণা ছাড়া ১০০% বিশ্বস্ততার সাথে ফ্রি ফায়ার আইডি কিনুন
        </p>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st) => (
            <div
              key={st.step}
              className="p-4 rounded-2xl bg-black/40 border border-white/5 relative flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#ff2a85]/20 border border-[#ff2a85]/40 text-[#ff2a85] font-black text-sm flex items-center justify-center mb-3 shadow-[0_0_10px_rgba(255,42,133,0.3)]">
                  {st.step}
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">{st.title}</h4>
                <p className="text-xs text-[#d8b4d8] leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notice Disclaimer */}
        <div className="mt-6 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white block mb-0.5">সতর্কবার্তা:</strong>
            আমাদের শুধুমাত্র এই ওয়েবসাইটে দেওয়া বিকাশ, নগদ এবং রকেট নম্বর ছাড়া অন্য কোথাও কোনো লেনদেন করবেন না। জিরো পয়েন্ট এফএফ ব্যতীত অন্য কোনো ফেক গ্রুপ বা পেজের সাথে কোনো ডিল করবেন না।
          </div>
        </div>
      </div>
    </section>
  );
};
