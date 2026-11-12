import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('bd_mart_last_view');
      localStorage.removeItem('bd_mart_auth');
      localStorage.removeItem('bd_mart_products');
      localStorage.removeItem('bd_mart_orders');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 font-sans text-neutral-800">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-6 md:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-orange-50 border border-orange-200 rounded-full flex items-center justify-center mx-auto text-orange-600">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-neutral-800 font-display">
                ওয়েবসাইট লোড হতে সমস্যা হয়েছে
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                ব্রাউজারের ক্যাশ বা পুরনো ডাটার কারণে পেজটিতে ত্রুটি দেখা দিয়েছিল। নিচের বাটনে ক্লিক করে পেজটি আবার চালু করুন।
              </p>
              {this.state.error && (
                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-[11px] font-mono text-rose-600 text-left overflow-x-auto max-h-24">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                পেজ রিলোড করুন (Reload Page)
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5 text-neutral-500" />
                ক্যাশ রিসেট করে হোমপেজে যান
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
