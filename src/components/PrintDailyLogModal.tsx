import React, { useMemo, useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import {
  AppSettings,
  CategoryTreeItem,
  StorageLocation,
  SparePart,
  MonthlyInventoryLog
} from '../types/mro';
import { Language, translations } from '../i18n/translations';

interface PrintDailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  monthKey: string;
  parts: SparePart[];
  inventoryLogs: Record<string, MonthlyInventoryLog>;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
  selectedMainCatId?: string;
  printMode?: 'OUT' | 'IN'; // 'OUT': Sổ Xuất, 'IN': Sổ Nhập
  language?: Language;
}

const DEFAULT_SIGNATURES = [
  { id: '1', role: 'Dibuat (Người lập)', name: 'Staff MRO' },
  { id: '2', role: 'Diperiksa (Kiểm tra)', name: 'Spv MRO' },
  { id: '3', role: 'Mengetahui (Kế toán)', name: 'Accounting' },
  { id: '4', role: 'Disetujui (Phê duyệt)', name: 'Factory Manager' },
];

export const PrintDailyLogModal: React.FC<PrintDailyLogModalProps> = ({
  isOpen,
  onClose,
  settings,
  monthKey,
  parts,
  inventoryLogs,
  categories,
  locations,
  selectedMainCatId,
  printMode = 'OUT',
  language = 'vi'
}) => {
  const t = translations[language];

  // Listen for Ctrl+P / Cmd+P while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Safe data access
  const safeParts = useMemo(() => (Array.isArray(parts) ? parts : []), [parts]);
  const safeLogs = useMemo(() => (inventoryLogs || {}), [inventoryLogs]);
  const safeCategories = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);
  const safeLocations = useMemo(() => (Array.isArray(locations) ? locations : []), [locations]);
  const safeSignatures = useMemo(() => {
    return (settings?.signatures && Array.isArray(settings.signatures) && settings.signatures.length > 0)
      ? settings.signatures
      : DEFAULT_SIGNATURES;
  }, [settings?.signatures]);

  // Parse Year and Month
  const [year, month] = useMemo(() => {
    const p = (monthKey || '2026-10').split('-').map(Number);
    return [p[0] || 2026, p[1] || 10];
  }, [monthKey]);

  // Days in month calculation
  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  // Day columns metadata (1..daysInMonth)
  const daysMetadata = useMemo(() => {
    const list = [];
    const dayNamesVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayNamesId = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayNames = language === 'id' ? dayNamesId : dayNamesVi;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      list.push({
        day: d,
        name: dayNames[dayOfWeek],
        isWeekend
      });
    }
    return list;
  }, [year, month, daysInMonth, language]);

  // Selected Category Keyword (Red & Underline)
  const selectedCat = useMemo(() => {
    return safeCategories.find(c => c.id === selectedMainCatId && c.type === 'MAIN_CAT');
  }, [safeCategories, selectedMainCatId]);

  const categoryKeyword = useMemo(() => {
    if (!selectedCat) return 'MRO';
    if (selectedCat.code) {
      return selectedCat.code.replace(/_/g, ' ').trim().toUpperCase();
    }
    return selectedCat.name.replace(/\(.*?\)/g, '').trim().toUpperCase() || 'MRO';
  }, [selectedCat]);

  const catMap = useMemo(() => new Map(safeCategories.map(c => [c.id, c.code || c.name])), [safeCategories]);
  const locMap = useMemo(() => new Map(safeLocations.map(l => [l.id, l])), [safeLocations]);

  // Calculate daily issue / receive sums per day across displayed parts
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      totals[`day_${d}`] = 0;
    }
    safeParts.forEach(p => {
      const log = safeLogs[`${monthKey}_${p.id}`];
      const sourceMap = printMode === 'IN' ? log?.daily_receives : log?.daily_issues;
      if (sourceMap) {
        for (let d = 1; d <= daysInMonth; d++) {
          const val = sourceMap[`day_${d}`] || 0;
          totals[`day_${d}`] += val;
        }
      }
    });
    return totals;
  }, [safeParts, safeLogs, monthKey, daysInMonth, printMode]);

  if (!isOpen) return null;

  const handlePrint = () => {
    try {
      window.focus();
      setTimeout(() => {
        window.print();
      }, 50);
    } catch (e) {
      console.error('Print trigger failed:', e);
    }
  };

  return (
    <div className="print-modal-container fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-full print:h-auto">
      {/* Modal Container */}
      <div className="print-modal-card bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-[98vw] overflow-hidden my-2 max-h-[96vh] flex flex-col print:border-none print:shadow-none print:rounded-none print:max-w-none print:max-h-none print:m-0 print:p-0 print:overflow-visible print:block print:w-full print:h-auto">
        
        {/* Controls Bar (Hidden during actual print) */}
        <div className="print-controls-bar flex items-center justify-between px-6 py-3 bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">
              {printMode === 'IN'
                ? (language === 'id' ? 'Pratinjau Lembar SO Penerimaan (Landscape)' : 'Xem Trước Phiếu Kiểm Kê Nhập Trong Tháng (Khổ Giấy Nằm Ngang - Landscape)')
                : (language === 'id' ? 'Pratinjau Lembar SO Pengeluaran (Landscape)' : 'Xem Trước Phiếu Kiểm Kê Xuất Trong Tháng (Khổ Giấy Nằm Ngang - Landscape)')}
            </span>
            <span className="text-xs text-slate-400 ml-2 hidden md:inline">
              (Phím tắt: Ctrl + P)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1D46B6] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title="Nhấn để mở hộp thoại in của trình duyệt (hoặc phím tắt Ctrl+P)"
            >
              <Printer className="w-4 h-4" />
              <span>{t.btnPrintNow} (Landscape)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Landscape Paper Area */}
        <div 
          id="print-daily-log-sheet"
          className="print-paper-content p-6 overflow-x-auto overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible w-full min-w-[1100px]"
        >
          {/* Top Initial Header Block (Only printed on Page 1, never repeated on subsequent pages) */}
          <div className="print-initial-header break-inside-avoid mb-3">
            {/* Header Title Block */}
            <div className="border-b-2 border-slate-900 pb-2 mb-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-lg font-black uppercase tracking-wide text-slate-900 leading-tight">
                    LAPORAN PENGENDALIAN STOK MRO - {settings.factory_name || 'JS BOYOLALI'}
                  </h1>
                  
                  {/* Kategori line: Only display when a specific category is selected in Sổ A */}
                  {selectedCat && categoryKeyword ? (
                    <div className="text-xs font-bold text-slate-900 tracking-wide uppercase mt-1">
                      Kategori: STOK SPAREPART{' '}
                      <u 
                        className="text-red-600 font-black underline tracking-wider" 
                        style={{ color: 'red', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                      >
                        {categoryKeyword}
                      </u>{' '}
                      {settings.factory_name || 'JS BOYOLALI'}
                    </div>
                  ) : null}

                  <p className="text-[10.5px] font-semibold text-slate-600 tracking-wider uppercase mt-0.5">
                    {printMode === 'IN'
                      ? (language === 'id'
                          ? `CATATAN PENERIMAAN ${daysInMonth} HARI DALAM BULAN (DAILY RECEIVE LOG) · PT JS CORP BOYOLALI`
                          : `SỔ THEO DÕI NHẬP KHO ${daysInMonth} NGÀY TRONG THÁNG (DAILY RECEIVE LOG) · PT JS CORP BOYOLALI`)
                      : (language === 'id'
                          ? `CATATAN PENGELUARAN ${daysInMonth} HARI DALAM BULAN (DAILY ISSUE LOG) · PT JS CORP BOYOLALI`
                          : `SỔ THEO DÕI XUẤT KHO ${daysInMonth} NGÀY TRONG THÁNG (DAILY ISSUE LOG) · PT JS CORP BOYOLALI`)}
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-800 space-y-0.5 font-mono">
                  <div>{t.printAuditPeriod}: <strong>{monthKey}</strong></div>
                  <div>{t.printEffectiveDate}: <strong>{settings.effective_date}</strong></div>
                  <div>{t.printAuditDate}: <strong>{settings.audit_date}</strong></div>
                </div>
              </div>
            </div>

            {/* Ban Ký Duyệt (Header Signatures Stamp Grid - Right Aligned) */}
            <div className="flex flex-col items-end ml-auto w-fit break-inside-avoid">
              <div className="text-[11px] font-bold uppercase text-slate-900 mb-1.5 text-right w-full tracking-wide">
                {t.printBoardOfSignatures}
              </div>
              <div className="inline-flex border border-slate-800 divide-x divide-slate-800 text-center text-xs bg-white shadow-2xs">
                {safeSignatures.map((sig) => (
                  <div key={sig.id} className="w-[104px] flex flex-col">
                    <div className="bg-slate-100 py-1 px-1 font-bold border-b border-slate-800 text-[10px] uppercase truncate text-slate-900">
                      {sig.role}
                    </div>
                    <div className="h-16 flex items-end justify-center pb-1.5 px-1 font-semibold text-[10.5px] text-slate-800 truncate">
                      {sig.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main 31-Day Printable Table in Landscape - Exactly mirrors ReportModule without Actions */}
          <table className="w-full table-fixed text-left border-collapse border border-slate-800 text-[10px]">
            <thead>
              {/* Row 1 Header in Sentence Case */}
              <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-800">
                {/* 1. No. */}
                <th rowSpan={2} className="py-1 px-0.5 border border-slate-800 text-center w-[24px]">
                  {t.colNo}
                </th>
                {/* 2. Danh mục */}
                <th rowSpan={2} className="py-1 px-1 border border-slate-800 w-[74px] truncate">
                  {t.colCategory}
                </th>
                {/* 3. Tên phụ tùng & vị trí (Rộng thêm: 210px) */}
                <th rowSpan={2} className="py-1 px-1.5 border border-slate-800 w-[210px] truncate">
                  {t.colPartNameLocation}
                </th>
                {/* 4. Mã máy & hãng */}
                <th rowSpan={2} className="py-1 px-1 border border-slate-800 w-[74px] truncate">
                  {t.colMachineBrand}
                </th>
                {/* 5. Trạng thái (L/A) */}
                <th rowSpan={2} className="py-1 px-0.5 border border-slate-800 text-center w-[26px]">
                  {t.colStatus}
                </th>
                
                {/* 6. Cân đối tồn kho thời gian thực - Rộng thêm: mỗi cột 44px */}
                <th colSpan={4} className="py-0.5 px-0.5 border border-slate-800 text-center bg-slate-200/80 text-[9.5px]">
                  {t.colRealtimeBalance}
                </th>

                {/* 7. Sổ theo dõi trong tháng (1..daysInMonth) */}
                <th colSpan={daysInMonth} className="py-0.5 px-0.5 border border-slate-800 text-center bg-slate-200/80 text-[9.5px]">
                  {printMode === 'IN' ? t.colDailyLogTitleIn : t.colDailyLogTitleOut}
                </th>
              </tr>

              {/* Row 2 Sub-Headers in Sentence Case */}
              <tr className="bg-slate-50 font-bold text-slate-800 border-b border-slate-800 text-[9.5px]">
                {/* 4 Equal Balance Columns: Tồn đầu, Nhập, Xuất, Tồn cuối (mỗi cột 44px) */}
                <th className="py-1 px-0.5 border border-slate-800 text-center w-[44px] bg-slate-50">
                  {t.colBeginningStock}
                </th>
                <th className={`py-1 px-0.5 border border-slate-800 text-center w-[44px] ${printMode === 'IN' ? 'bg-[#F5D0FE] text-purple-950 font-black' : 'bg-purple-50'}`}>
                  {t.colReceived}
                </th>
                <th className={`py-1 px-0.5 border border-slate-800 text-center w-[44px] ${printMode === 'OUT' ? 'bg-[#FED7AA] text-orange-950 font-black' : 'bg-orange-50 font-bold'}`}>
                  {t.colIssued}
                </th>
                <th className="py-1 px-0.5 border border-slate-800 text-center w-[44px] bg-emerald-50 font-black text-emerald-950">
                  {t.colEndingStock}
                </th>

                {/* Day 1 to End of Month Columns (Giảm chiều rộng mỗi cột còn 18px) */}
                {daysMetadata.map((d) => (
                  <th
                    key={d.day}
                    className={`py-0.5 px-0 border border-slate-800 text-center w-[18px] min-w-[18px] max-w-[18px] ${
                      d.isWeekend ? 'bg-slate-200 text-slate-700' : 'bg-white'
                    }`}
                  >
                    <div className="text-[7px] leading-tight opacity-75">{d.name}</div>
                    <div className="font-mono font-bold leading-tight text-[9px]">{d.day}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 font-mono">
              {safeParts.map((part, index) => {
                const log = safeLogs[`${monthKey}_${part.id}`] || {
                  beginning_stock: 0,
                  received_in_month: 0,
                  daily_issues: {},
                  daily_receives: {},
                  total_issue: 0,
                  current_stock: 0
                };
                const isLimit = log.current_stock <= part.min_limit;
                const loc = locMap.get(part.location_id);
                const mainCatName = (part.main_cat_id && catMap.get(part.main_cat_id)) || '-';
                const subCatName = (part.sub_cat_id && catMap.get(part.sub_cat_id)) || '-';

                return (
                  <tr key={part.id} className="border-b border-slate-400 print:break-inside-avoid">
                    {/* 1. No. */}
                    <td className="py-1 px-0.5 text-center border-r border-slate-800 text-[9.5px] w-[24px]">
                      {index + 1}
                    </td>

                    {/* 2. Danh mục (2 dòng) */}
                    <td className="py-1 px-1 border-r border-slate-800 font-sans w-[74px]">
                      <div className="font-bold text-slate-900 leading-tight truncate text-[10px]">{mainCatName}</div>
                      <div className="text-[8.5px] text-slate-600 truncate mt-0.5 lowercase">{subCatName}</div>
                    </td>

                    {/* 3. Tên phụ tùng & vị trí (2 dòng - rộng 210px - không có SKU) */}
                    <td className="py-1 px-1.5 border-r border-slate-800 font-sans w-[210px]">
                      <div className="font-bold text-slate-900 leading-tight truncate max-w-[205px] text-[10.5px]">
                        {part.part_name}
                      </div>
                      <div className="text-[9px] text-slate-600 font-mono truncate max-w-[205px] mt-0.5">
                        {t.unitLabel}: {part.unit} · {t.minLimitLabel}: {part.min_limit} · LOC: {loc?.barcode || part.location_id}
                      </div>
                    </td>

                    {/* 4. Mã máy & hãng */}
                    <td className="py-1 px-1 border-r border-slate-800 font-sans w-[74px]">
                      <div className="font-bold text-slate-900 leading-tight truncate text-[10px] font-mono">{part.machine_code || '-'}</div>
                      <div className="text-[8.5px] text-slate-600 truncate mt-0.5">{part.machine_brand || '-'}</div>
                    </td>

                    {/* 5. Trạng thái: hiển thị gọn L/A */}
                    <td className="py-1 px-0.5 text-center border-r border-slate-800 font-sans w-[26px]">
                      <span className={`inline-block w-4 h-4 leading-4 text-center rounded text-[9px] font-black ${
                        isLimit ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {isLimit ? 'L' : 'A'}
                      </span>
                    </td>

                    {/* 6. Cân đối tồn kho: 4 cột rộng 44px chia đều bằng nhau */}
                    {/* Tồn đầu */}
                    <td className="py-1 px-0.5 text-center border-r border-slate-800 bg-slate-50 text-[10px] w-[44px]">
                      {log.beginning_stock}
                    </td>

                    {/* Nhập */}
                    <td className={`py-1 px-0.5 text-center border-r border-slate-800 text-[10px] w-[44px] ${printMode === 'IN' ? 'bg-[#F5D0FE]/70 text-purple-950 font-black' : 'bg-purple-50 font-bold text-purple-900'}`}>
                      {log.received_in_month > 0 ? `+${log.received_in_month}` : '0'}
                    </td>

                    {/* Xuất */}
                    <td className={`py-1 px-0.5 text-center border-r border-slate-800 text-[10px] w-[44px] ${printMode === 'OUT' ? 'bg-[#FED7AA]/70 text-orange-950 font-black' : 'bg-orange-50 font-bold text-orange-950'}`}>
                      {log.total_issue > 0 ? `-${log.total_issue}` : '0'}
                    </td>

                    {/* Tồn cuối */}
                    <td className={`py-1 px-0.5 text-center border-r border-slate-800 bg-emerald-50 font-black text-[10.5px] w-[44px] ${
                      isLimit ? 'text-red-700 underline' : 'text-emerald-950'
                    }`}>
                      {log.current_stock}
                    </td>

                    {/* 7. 31 Ngày: Sổ theo dõi nhập-xuất (mỗi cột giảm gọn 18px) */}
                    {daysMetadata.map((d) => {
                      const dayVal = printMode === 'IN'
                        ? log.daily_receives?.[`day_${d.day}`]
                        : log.daily_issues?.[`day_${d.day}`];

                      const hasVal = typeof dayVal === 'number' && dayVal > 0;
                      const activeColor = printMode === 'IN'
                        ? 'font-bold text-purple-950 bg-[#F5D0FE] print:bg-[#F5D0FE]'
                        : 'font-bold text-blue-950 bg-[#BFDBFE] print:bg-[#BFDBFE]';

                      return (
                        <td
                          key={d.day}
                          className={`py-1 px-0 text-center border-r border-slate-800 text-[9.5px] w-[18px] min-w-[18px] max-w-[18px] ${
                            hasVal
                              ? activeColor
                              : d.isWeekend
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-white text-slate-400'
                          }`}
                        >
                          {hasVal ? dayVal : ''}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {/* Total Footer Row */}
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-900 print:break-inside-avoid">
                <td colSpan={5} className="py-1.5 px-2 text-right border border-slate-800 uppercase font-sans text-[10px]">
                  {t.totalSumLabel} ({safeParts.length} {t.printItemsCount}):
                </td>
                <td className="py-1 px-0.5 text-center font-mono border border-slate-800 text-[10px] w-[44px]">
                  {safeParts.reduce((acc, p) => acc + (safeLogs[`${monthKey}_${p.id}`]?.beginning_stock || 0), 0)}
                </td>
                <td className={`py-1 px-0.5 text-center font-mono border border-slate-800 text-[10px] w-[44px] ${printMode === 'IN' ? 'bg-[#F5D0FE] text-purple-950 font-black' : 'bg-purple-100'}`}>
                  +{safeParts.reduce((acc, p) => acc + (safeLogs[`${monthKey}_${p.id}`]?.received_in_month || 0), 0)}
                </td>
                <td className={`py-1 px-0.5 text-center font-mono border border-slate-800 text-[10px] w-[44px] ${printMode === 'OUT' ? 'bg-[#FED7AA] text-orange-950 font-black' : 'bg-orange-100'}`}>
                  -{safeParts.reduce((acc, p) => acc + (safeLogs[`${monthKey}_${p.id}`]?.total_issue || 0), 0)}
                </td>
                <td className="py-1 px-0.5 text-center font-mono border border-slate-800 bg-emerald-100 font-black text-[10.5px] w-[44px]">
                  {safeParts.reduce((acc, p) => acc + (safeLogs[`${monthKey}_${p.id}`]?.current_stock || 0), 0)}
                </td>

                {/* Daily totals for each day */}
                {daysMetadata.map((d) => {
                  const daySum = dailyTotals[`day_${d.day}`] || 0;
                  const activeFooterColor = printMode === 'IN'
                    ? 'font-bold bg-[#F5D0FE] text-purple-950'
                    : 'font-bold bg-orange-100 text-orange-950';

                  return (
                    <td
                      key={d.day}
                      className={`py-1 px-0 text-center font-mono text-[9px] border border-slate-800 w-[18px] min-w-[18px] max-w-[18px] ${
                        daySum > 0 ? activeFooterColor : 'text-slate-400'
                      }`}
                    >
                      {daySum > 0 ? (printMode === 'IN' ? `+${daySum}` : daySum) : ''}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>

          {/* Footer Timestamp */}
          <div className="mt-3 flex items-center justify-between text-[9.5px] text-slate-500 font-sans print:break-inside-avoid">
            <span>{t.printFooterSystem}</span>
            <span>{t.printPrintDate}: {new Date().toLocaleString(language === 'id' ? 'id-ID' : 'vi-VN')}</span>
          </div>

        </div>

      </div>

      {/* Embedded Landscape Print CSS - Reset modal to normal document flow */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm 4mm 6mm 4mm;
          }
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-modal-container {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            display: block !important;
          }
          .print-modal-card {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: none !important;
            max-height: none !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .print-paper-content {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          .print-controls-bar {
            display: none !important;
          }
          table {
            page-break-inside: auto;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  );
};
