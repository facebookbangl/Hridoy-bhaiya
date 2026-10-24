import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  whatsappNumber: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ whatsappNumber }) => {
  const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanWa}?text=${encodeURIComponent('হ্যালো ZERO POINT FF, আমি একটি ফ্রি ফায়ার আইডি কিনতে চাই।')}`;

  return (
    <aside aria-label="Support contact" className="fixed bottom-4 right-4 z-40">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Helpline"
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#25d366] text-white font-bold text-xs sm:text-sm shadow-[0_6px_25px_rgba(37,211,102,0.5)] hover:bg-[#20ba59] hover:scale-105 active:scale-95 transition-all group border border-white/20"
      >
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-[#25d366] group-hover:rotate-12 transition-transform" />
        <span className="whitespace-nowrap tracking-wide">WhatsApp হেল্পলাইন</span>
      </a>
    </aside>
  );
};
