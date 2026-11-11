import React, { Component, ErrorInfo, ReactNode } from 'react';
import { safeClearCache } from '../utils/safeStorage';
import { OFFICIAL_WHATSAPP_NUMBER, formatWhatsAppUrl } from '../utils/whatsapp';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isOffline: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  };

  private onlineListener?: () => void;
  private offlineListener?: () => void;

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log technical error safely for debugging
    console.error('[ZERO POINT FF ErrorBoundary] Captured error:', error?.message || error, errorInfo?.componentStack);
  }

  public componentDidMount() {
    if (typeof window !== 'undefined') {
      this.onlineListener = () => this.setState({ isOffline: false });
      this.offlineListener = () => this.setState({ isOffline: true });
      window.addEventListener('online', this.onlineListener);
      window.addEventListener('offline', this.offlineListener);
    }
  }

  public componentWillUnmount() {
    if (typeof window !== 'undefined') {
      if (this.onlineListener) window.removeEventListener('online', this.onlineListener);
      if (this.offlineListener) window.removeEventListener('offline', this.offlineListener);
    }
  }

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleResetAndReload = () => {
    safeClearCache();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const waSupportUrl = formatWhatsAppUrl(
        OFFICIAL_WHATSAPP_NUMBER,
        'আসসালামু আলাইকুম ZERO POINT FF, আমার ব্রাউজারে ওয়েবসাইট লোডিং সমস্যা দেখা দিয়েছে। সাহায্য প্রয়োজন।'
      );

      return (
        <div className="min-h-screen bg-[#07020d] text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none font-sans">
          {/* Glowing Ambient Halo */}
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#12071d]/90 border border-[#ff2a85]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,42,133,0.2)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff2a85] via-purple-500 to-[#ff2a85]" />

            {/* Offline Alert Badge if connection lost */}
            {this.state.isOffline && (
              <div className="mb-4 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-center gap-2">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
                <span>ইন্টারনেট সংযোগ বিচ্ছিন্ন রয়েছে! ডাটা বা ওয়াইফাই চেক করুন।</span>
              </div>
            )}

            {/* Warning Shield Graphic */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#ff2a85]/20 to-red-500/20 border border-[#ff2a85]/40 flex items-center justify-center mx-auto mb-4 text-[#ff2a85] shadow-[0_0_24px_rgba(255,42,133,0.35)]">
              <svg className="w-9 h-9 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h2 className="text-xl sm:text-2xl font-black mb-1.5 tracking-wider text-white">
              ZERO POINT <span className="text-[#ff2a85]">FF</span>
            </h2>

            <p className="text-sm font-semibold text-zinc-200 mb-1">
              পেজ লোড করতে সাময়িক সমস্যা হয়েছে
            </p>
            <p className="text-xs text-[#d8b4d8] mb-6 leading-relaxed">
              সাময়িক নেটওয়ার্ক বা মোবাইল ব্রাউজার সমস্যার কারণে এমন হতে পারে। নিচের বাটন চেপে সহজে পেজ লোড করুন।
            </p>

            {/* Recovery Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={this.handleTryAgain}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#ff2a85] to-[#ff1a53] hover:from-[#e01972] hover:to-[#e60f44] text-white font-bold rounded-xl text-sm shadow-[0_4px_20px_rgba(255,42,133,0.4)] transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                <span>আবার চেষ্টা করুন (Try Again)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer active:scale-98"
                >
                  পেজ রিলোড
                </button>

                <button
                  type="button"
                  onClick={this.handleResetAndReload}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-medium border border-white/5 transition-all cursor-pointer active:scale-98"
                  title="ক্যাশ ক্লিয়ার করে সম্পূর্ণ ফ্রেশ লোড করুন"
                >
                  ক্যাশ রিসেট
                </button>
              </div>

              {/* WhatsApp Support Direct Link */}
              <a
                href={waSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold pt-2"
              >
                <span>হোয়াটসঅ্যাপে এডমিন সহায়তা নিন</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
