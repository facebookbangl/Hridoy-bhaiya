import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-3 fade-in duration-200">
      <div className="px-4 py-2.5 rounded-xl bg-[#1d1024]/95 border border-[#ff2a85] text-white text-xs sm:text-sm font-semibold shadow-[0_10px_30px_rgba(255,42,133,0.4)] flex items-center gap-2 backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-[#ff2a85] shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
};
