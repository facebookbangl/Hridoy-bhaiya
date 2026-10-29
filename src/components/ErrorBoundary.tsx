import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ZERO POINT FF application:', error, errorInfo);
  }

  private handleResetAndReload = () => {
    try {
      localStorage.removeItem('zp_settings');
      localStorage.removeItem('zp_accounts');
      localStorage.removeItem('zp_reviews');
      localStorage.removeItem('zp_orders');
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a060d] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            ZERO POINT <span className="text-[#ff2a85]">FF</span>
          </h2>
          <p className="text-sm text-[#d8b4d8] max-w-md mb-6 leading-relaxed">
            পেজ লোড করতে সাময়িক সমস্যা হয়েছে। ক্যাশ ক্লিয়ার করে ফ্রেশ পেজ লোড করতে নিচের বাটনে চাপ দিন।
          </p>
          <button
            onClick={this.handleResetAndReload}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ff2a85] hover:bg-[#e01972] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,42,133,0.4)] transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>পেজ রিলোড করুন</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
