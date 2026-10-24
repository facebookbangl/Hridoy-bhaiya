import React from 'react';
import { Flame } from 'lucide-react';

interface HorrorLoaderProps {
  message?: string;
  mini?: boolean;
}

export const HorrorLoader: React.FC<HorrorLoaderProps> = ({ 
  message = 'লোড হচ্ছে...', 
  mini = false 
}) => {
  if (mini) {
    return (
      <div className="flex items-center justify-center gap-2 p-3 text-xs text-[#d8b4d8]">
        <div className="w-4 h-4 border-2 border-[#ff2a85]/30 border-t-[#ff2a85] rounded-full animate-spin" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl max-w-sm w-full flex flex-col items-center justify-center text-center shadow-[0_0_35px_rgba(255,42,133,0.3)] border border-[#ff2a85]/30 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative w-16 h-16 flex items-center justify-center mb-4">
          {/* Animated Neon Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#ff2a85]/40 animate-spin" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-1.5 rounded-full border-2 border-t-[#ff2a85] border-r-transparent border-b-purple-500 border-l-transparent animate-spin" style={{ animationDuration: '1.2s' }} />
          
          {/* Pulsing Center Icon */}
          <div className="text-[#ff2a85] drop-shadow-[0_0_12px_rgba(255,42,133,0.8)] animate-pulse">
            <Flame className="w-7 h-7 fill-[#ff2a85]/20" />
          </div>
        </div>

        <div className="font-extrabold text-base tracking-wider text-white mb-1">
          ZERO POINT <span className="text-[#ff2a85] pink-glow-text">FF</span>
        </div>
        <p className="text-xs text-[#d8b4d8] animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};
