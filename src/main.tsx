import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200 max-w-md w-full text-center">
            <h2 className="text-base font-bold text-red-600 mb-2">Đã xảy ra sự cố hiển thị</h2>
            <p className="text-xs text-slate-600 mb-4 font-mono bg-slate-50 p-2 rounded border border-slate-200 text-left overflow-auto max-h-32">
              {this.state.error?.message || 'Lỗi không xác định'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('mro_cached_database_v1');
                    localStorage.removeItem('mro_cached_database_v2');
                  } catch {}
                  window.location.reload();
                }}
                className="px-4 py-2 bg-[#1D46B6] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
              >
                Tải lại & Làm mới bộ nhớ
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
