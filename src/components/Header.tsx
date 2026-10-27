import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Calendar,
  Layers,
  FileSpreadsheet,
  Settings,
  Monitor,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { SyncStatus, AppSettings } from '../types/mro';
import { mroService } from '../services/mroStorage';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  currentTab: 'report' | 'master' | 'settings';
  onTabChange: (tab: 'report' | 'master' | 'settings') => void;
  activeMonth: string; // "2026-10"
  onMonthChange: (month: string) => void;
  settings: AppSettings;
  stockLimitAlertCount: number;
  selectedCategoryName?: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activeMonth,
  onMonthChange,
  settings,
  stockLimitAlertCount,
  selectedCategoryName,
  language,
  onLanguageChange
}) => {
  const t = translations[language];

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: true,
    workstations_online: 1,
    last_synced: new Date().toLocaleTimeString(),
    device_id: 'PC-LOCAL'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsub = mroService.subscribeSync((status) => {
      setSyncStatus(status);
    });
    return unsub;
  }, []);

  const handlePrevMonth = () => {
    const [yearStr, monthStr] = activeMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    onMonthChange(`${year}-${String(month).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yearStr, monthStr] = activeMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    onMonthChange(`${year}-${String(month).padStart(2, '0')}`);
  };

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await mroService.fetchFullDatabase();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header 
      className="text-white sticky top-0 z-40 shadow-md print:hidden"
      style={{ backgroundColor: '#1D46B6' }}
    >
      {/* Top Bar: Brand, Month Picker, Stock Limit, Multi-Workstation Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-sm font-bold border border-white/25 shrink-0">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide text-white drop-shadow-xs">
                  JS CORPORATION
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                MRO Smart stock system
              </p>
            </div>
          </div>

          {/* Center: Month Selector with "KIỂM KÊ" in front, height h-10 matching Logo */}
          <div className="flex items-center h-10 bg-black/25 rounded-lg px-2 border border-white/25 shadow-xs backdrop-blur-xs gap-1">
            <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5 px-1.5 border-r border-white/20 mr-1 select-none">
              <Calendar className="w-4 h-4 text-blue-200" />
              <span>{t.auditPeriod}</span>
            </span>
            <button
              onClick={handlePrevMonth}
              title="Tháng trước / Bulan Sebelumnya"
              className="p-1.5 hover:bg-white/15 rounded text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="month"
              value={activeMonth}
              onChange={(e) => e.target.value && onMonthChange(e.target.value)}
              className="bg-transparent text-white px-2 py-1 text-xs font-mono font-bold focus:outline-none cursor-pointer"
            />
            <button
              onClick={handleNextMonth}
              title="Tháng sau / Bulan Berikutnya"
              className="p-1.5 hover:bg-white/15 rounded text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Stock Limit & Multi-Workstation with height h-10 */}
          <div className="flex items-center gap-3">
            {/* Stock Limit Warning Counter */}
            {stockLimitAlertCount > 0 && (
              <button
                onClick={() => onTabChange('report')}
                className="flex items-center gap-1.5 px-3 h-10 rounded-lg bg-red-600 border border-red-400 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-sm animate-pulse cursor-pointer"
                title={`${stockLimitAlertCount} phụ tùng dưới mức tồn tối thiểu`}
              >
                <AlertTriangle className="w-4 h-4 text-yellow-300" />
                <span>
                  {stockLimitAlertCount} {t.stockLimitAlert}{selectedCategoryName ? ` (${selectedCategoryName})` : ''}
                </span>
              </button>
            )}

            {/* Multi-Workstation Real-time Sync Status */}
            <div 
              className="flex items-center gap-2 px-3 h-10 bg-black/20 border border-white/20 rounded-lg text-xs backdrop-blur-xs"
              title={`Mã máy trạm: ${syncStatus.device_id} | Đồng bộ: ${syncStatus.last_synced}`}
            >
              <div className="flex items-center gap-1.5 relative">
                {syncStatus.connected ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-300" />
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute" />
              </div>
              <div className="flex flex-col text-left justify-center">
                <span className="text-[11px] font-medium text-white flex items-center gap-1 leading-tight">
                  <Monitor className="w-3.5 h-3.5 text-emerald-300" />
                  {syncStatus.workstations_online > 1 ? (
                    <span>{syncStatus.workstations_online} {t.workstationsOnline}</span>
                  ) : (
                    <span>{t.workstationsReady}</span>
                  )}
                </span>
                <span className="text-[9px] text-blue-200 font-mono leading-tight">
                  {syncStatus.device_id}
                </span>
              </div>
              <button
                onClick={handleManualSync}
                className="p-1 hover:bg-white/15 rounded text-blue-200 hover:text-white transition-colors ml-0.5 cursor-pointer"
                title={t.syncNow}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
              </button>
            </div>
          </div>

        </div>

        {/* Tab Navigation Bar - Google Chrome Tab Style connecting seamlessly to workspace */}
        <nav className="flex items-center justify-between border-t border-white/20 pt-1.5 px-1 relative">
          <div className="flex items-end gap-1 -mb-[1px]">
            {/* Tab 1: Module 1: Báo Cáo Tổng Hợp */}
            <button
              onClick={() => onTabChange('report')}
              className={`flex items-center gap-2 px-4 py-2 text-xs transition-all cursor-pointer ${
                currentTab === 'report'
                  ? 'bg-slate-100 text-[#1D46B6] font-bold rounded-t-xl shadow-xs border-t-2 border-l border-r border-[#1D46B6]/20'
                  : 'text-white/85 hover:bg-white/10 hover:text-white rounded-t-lg'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t.tabModule1}</span>
            </button>

            {/* Tab 2: Module 2: Quản Lý Phụ Tùng */}
            <button
              onClick={() => onTabChange('master')}
              className={`flex items-center gap-2 px-4 py-2 text-xs transition-all cursor-pointer ${
                currentTab === 'master'
                  ? 'bg-slate-100 text-[#1D46B6] font-bold rounded-t-xl shadow-xs border-t-2 border-l border-r border-[#1D46B6]/20'
                  : 'text-white/85 hover:bg-white/10 hover:text-white rounded-t-lg'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.tabModule2}</span>
            </button>

            {/* Tab 3: Module 3: Cài Đặt Hệ Thống */}
            <button
              onClick={() => onTabChange('settings')}
              className={`flex items-center gap-2 px-4 py-2 text-xs transition-all cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-slate-100 text-[#1D46B6] font-bold rounded-t-xl shadow-xs border-t-2 border-l border-r border-[#1D46B6]/20'
                  : 'text-white/85 hover:bg-white/10 hover:text-white rounded-t-lg'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t.tabModule3}</span>
            </button>
          </div>

          {/* Right: Language Switcher Button [ 🇻🇳 Tiếng Việt | 🇮🇩 Bahasa Indonesia ] */}
          <div className="flex items-center pb-1">
            <div className="flex items-center bg-black/25 rounded-lg p-0.5 border border-white/20 shadow-xs backdrop-blur-xs">
              <button
                type="button"
                onClick={() => onLanguageChange('vi')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'vi'
                    ? 'bg-white text-[#1D46B6] shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title="Chuyển sang Tiếng Việt"
              >
                <span>🇻🇳</span>
                <span>Tiếng Việt</span>
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('id')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'id'
                    ? 'bg-white text-[#1D46B6] shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title="Ganti ke Bahasa Indonesia"
              >
                <span>🇮🇩</span>
                <span>Bahasa Indonesia</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
