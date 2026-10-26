import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
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
      // 350ms graceful delay after page finish loading for smooth entrance
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
      // Fallback in case load event already occurred or is throttled
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
      aria-label="Support contact"
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
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#25d366] text-white font-bold text-xs sm:text-sm shadow-[0_6px_25px_rgba(37,211,102,0.5)] hover:bg-[#20ba59] hover:scale-105 active:scale-95 transition-all group border border-white/20 select-none"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-[#25d366] group-hover:rotate-12 transition-transform duration-200" />
        <span className="whitespace-nowrap tracking-wide">WhatsApp হেল্পলাইন</span>
      </a>
    </aside>
  );
};
