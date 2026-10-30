import React, { useState, useEffect } from 'react';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface FloatingWhatsAppProps {
  whatsappNumber: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ whatsappNumber }) => {
  const [isVisible, setIsVisible] = useState(false);
  const url = formatWhatsAppUrl(whatsappNumber, 'হ্যালো ZERO POINT FF, আমি একটি ফ্রি ফায়ার আইডি কিনতে চাই।');

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;

    const triggerEntrance = () => {
      timerId = setTimeout(() => {
        setIsVisible(true);
      }, 350);
    };

    if (document.readyState === 'complete') {
      triggerEntrance();
    } else {
      const handleLoad = () => {
        triggerEntrance();
      };
      window.addEventListener('load', handleLoad, { once: true });
      const fallbackTimer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(fallbackTimer);
        if (timerId) clearTimeout(timerId);
      };
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  return (
    <aside
      aria-label="WhatsApp Helpline"
      style={{
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`fixed bottom-4 right-4 z-40 transition-all duration-700 ${
        isVisible
          ? 'translate-x-0 translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-x-12 translate-y-12 opacity-0 scale-90 pointer-events-none'
      }`}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Helpline"
        title="সরাসরি অফিসিয়াল হোয়াটসঅ্যাপে যোগাযোগ করুন"
        className="group relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-[#128c7e]/90 via-[#20ba5a]/90 to-[#25d366]/90 backdrop-blur-md text-white shadow-[0_8px_32px_rgba(37,211,102,0.5),inset_0_1px_2px_rgba(255,255,255,0.35)] hover:shadow-[0_0_38px_rgba(37,211,102,0.85)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/40 select-none cursor-pointer"
      >
        {/* Glow backdrop */}
        <span className="absolute -inset-1 rounded-full bg-[#25d366] opacity-35 blur-md group-hover:opacity-75 transition-opacity pointer-events-none" />

        {/* WhatsApp Reference Logo Container */}
        <div className="relative z-10 flex items-center justify-center shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] p-0.5 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <img
              src="/assets/aistudio/images_1d3fa6a5.png"
              alt="WhatsApp"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300 border border-white" />
          </span>
        </div>

        {/* Text Details */}
        <div className="relative z-10 flex flex-col text-left pr-0.5">
          <span className="whitespace-nowrap font-black tracking-wide text-xs sm:text-sm leading-tight text-white drop-shadow-sm">
            WhatsApp হেল্পলাইন
          </span>
          <span className="text-[10px] text-emerald-100 font-bold leading-none hidden sm:inline-block mt-0.5">
            ২৪/৭ এডমিন সাপোর্ট
          </span>
        </div>
      </a>
    </aside>
  );
};
