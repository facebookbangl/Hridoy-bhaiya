import React from 'react';
import { Smartphone, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../types';

interface PaymentQuickBarProps {
  settings: SiteSettings;
  onShowToast: (msg: string) => void;
  onNavigateToIds?: () => void;
}

export const PaymentQuickBar: React.FC<PaymentQuickBarProps> = React.memo(() => {
  return (
    <div id="payment-numbers-section" className="scroll-mt-20">
      <div className="glass-panel-glow p-3.5 sm:p-4 rounded-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff2a85]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl glass-badge-pink flex items-center justify-center text-[#ff2a85] shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base leading-tight">অফিসিয়াল পেমেন্ট মেথডসমূহ</h3>
              <p className="text-[11px] text-[#d8b4d8] leading-tight mt-0.5">bKash ও Nagad (Personal Send Money) এর মাধ্যমে নিরাপদ লেনদেন</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-badge-emerald text-emerald-300 text-[11px] font-semibold self-start sm:self-auto shrink-0 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>১০০% নিরাপদ ও ম্যানুয়াল ভেরিফিকেশন</span>
          </div>
        </div>
      </div>
    </div>
  );
});
