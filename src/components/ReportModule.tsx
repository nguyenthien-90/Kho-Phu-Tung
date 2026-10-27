import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Package,
  Layers,
  Edit2,
  Copy,
  Trash2,
  Calendar,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  User,
  Building,
  Wrench,
  Sparkles
} from 'lucide-react';
import {
  AppSettings,
  CategoryTreeItem,
  StorageLocation,
  SparePart,
  MonthlyInventoryLog,
  StockTransaction,
  ReceiverItem
} from '../types/mro';
import { mroService } from '../services/mroStorage';
import { Language, translations } from '../i18n/translations';

interface ReportModuleProps {
  settings: AppSettings;
  monthKey: string;
  parts: SparePart[];
  inventoryLogs: Record<string, MonthlyInventoryLog>;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
  transactions?: StockTransaction[];
  receivers?: ReceiverItem[];
  selectedMainCatId?: string;
  onOpenPrint: (mode: 'OUT' | 'IN') => void;
  onEditPart: (part: SparePart) => void;
  onDuplicatePart: (part: SparePart) => void;
  language?: Language;
}

export const ReportModule: React.FC<ReportModuleProps> = ({
  settings,
  monthKey,
  parts,
  inventoryLogs,
  categories,
  locations,
  transactions = [],
  receivers = [],
  selectedMainCatId,
  onOpenPrint,
  onEditPart,
  onDuplicatePart,
  language = 'vi'
}) => {
  const t = translations[language];

  // Toggle mode for the 31-day log: 'OUT' = Sổ Xuất, 'IN' = Sổ Nhập
  const [viewMode, setViewMode] = useState<'OUT' | 'IN'>('OUT');
  const [selectedDayFocus, setSelectedDayFocus] = useState<number | null>(null);

  // Hover state for tooltip on number cells
  const [hoveredCell, setHoveredCell] = useState<{
    part: SparePart;
    day: number;
    val: number;
    mode: 'OUT' | 'IN';
    rect: DOMRect;
  } | null>(null);

  // Fast maps
  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c.code || c.name])), [categories]);
  const locMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);

  // Selected Category Keyword (highlight in Danh Mục)
  const selectedCat = categories.find(c => c.id === selectedMainCatId && c.type === 'MAIN_CAT');
  const categoryKeyword = useMemo(() => {
    if (!selectedCat) return '';
    return (selectedCat.code || selectedCat.name || '').trim().toUpperCase();
  }, [selectedCat]);

  // Parse Year and Month
  const [year, month] = useMemo(() => {
    const p = (monthKey || '2026-10').split('-').map(Number);
    return [p[0] || 2026, p[1] || 10];
  }, [monthKey]);

  // Days in month calculation
  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  // Today's date check
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
  const currentDay = isCurrentMonth ? today.getDate() : -1;

  // Day columns metadata (1..31)
  const daysMetadata = useMemo(() => {
    const list = [];
    const dayNames = language === 'id' 
      ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
      : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let d = 1; d <= 31; d++) {
      if (d <= daysInMonth) {
        const dateObj = new Date(year, month - 1, d);
        const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isSunday = dayOfWeek === 0;
        const isSaturday = dayOfWeek === 6;
        list.push({
          day: d,
          name: dayNames[dayOfWeek],
          isWeekend,
          isSunday,
          isSaturday,
          isToday: d === currentDay,
          isValid: true
        });
      } else {
        list.push({
          day: d,
          name: '-',
          isWeekend: true,
          isSunday: false,
          isSaturday: false,
          isToday: false,
          isValid: false
        });
      }
    }
    return list;
  }, [year, month, daysInMonth, currentDay, language]);

  // Calculate high-level summary KPIs for the 4 cards
  let totalMasuk = 0;
  let totalKeluar = 0;
  let countStockLimit = 0;
  let countAman = 0;

  parts.forEach(p => {
    const log = inventoryLogs[`${monthKey}_${p.id}`] || {
      beginning_stock: 0,
      received_in_month: 0,
      total_issue: 0,
      current_stock: 0
    };
    totalMasuk += log.received_in_month;
    totalKeluar += log.total_issue;
    if (log.current_stock <= p.min_limit) {
      countStockLimit++;
    } else {
      countAman++;
    }
  });

  // Calculate daily issue sums per day across displayed parts
  const dailyIssueTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (let d = 1; d <= 31; d++) {
      totals[`day_${d}`] = 0;
    }
    parts.forEach(p => {
      const log = inventoryLogs[`${monthKey}_${p.id}`];
      if (log?.daily_issues) {
        for (let d = 1; d <= 31; d++) {
          const val = log.daily_issues[`day_${d}`] || 0;
          totals[`day_${d}`] += val;
        }
      }
    });
    return totals;
  }, [parts, inventoryLogs, monthKey]);

  // Calculate daily receive sums per day across displayed parts
  const dailyReceiveTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (let d = 1; d <= 31; d++) {
      totals[`day_${d}`] = 0;
    }
    parts.forEach(p => {
      const log = inventoryLogs[`${monthKey}_${p.id}`];
      if (log?.daily_receives) {
        for (let d = 1; d <= 31; d++) {
          const val = log.daily_receives[`day_${d}`] || 0;
          totals[`day_${d}`] += val;
        }
      }
    });
    return totals;
  }, [parts, inventoryLogs, monthKey]);

  // Handle direct cell changes for daily issue
  const handleDailyIssueChange = (partId: string, day: number, rawValue: string) => {
    const dayKey = `day_${day}`;
    const num = rawValue === '' ? 0 : Math.max(0, parseInt(rawValue, 10) || 0);

    const logKey = `${monthKey}_${partId}`;
    const existingLog = inventoryLogs[logKey] || {
      id: logKey,
      month_key: monthKey,
      part_id: partId,
      beginning_stock: 0,
      received_in_month: 0,
      daily_issues: {},
      daily_receives: {},
      total_issue: 0,
      current_stock: 0
    };

    const updatedDaily = {
      ...(existingLog.daily_issues || {}),
      [dayKey]: num
    };

    mroService.updateInventoryLog(monthKey, partId, {
      daily_issues: updatedDaily
    });
  };

  // Handle direct cell changes for daily receive
  const handleDailyReceiveChange = (partId: string, day: number, rawValue: string) => {
    const dayKey = `day_${day}`;
    const num = rawValue === '' ? 0 : Math.max(0, parseInt(rawValue, 10) || 0);

    const logKey = `${monthKey}_${partId}`;
    const existingLog = inventoryLogs[logKey] || {
      id: logKey,
      month_key: monthKey,
      part_id: partId,
      beginning_stock: 0,
      received_in_month: 0,
      daily_issues: {},
      daily_receives: {},
      total_issue: 0,
      current_stock: 0
    };

    const updatedDailyReceives = {
      ...(existingLog.daily_receives || {}),
      [dayKey]: num
    };

    mroService.updateInventoryLog(monthKey, partId, {
      daily_receives: updatedDailyReceives
    });
  };

  // Delete part handler
  const handleDeletePart = async (part: SparePart) => {
    const promptMsg = language === 'id' 
      ? `Apakah Anda yakin ingin menghapus suku cadang "${part.part_name}" (${part.id})?`
      : `Bạn có chắc chắn muốn xóa phụ tùng "${part.part_name}" (${part.id}) khỏi hệ thống?`;
    if (confirm(promptMsg)) {
      await mroService.deletePart(part.id);
    }
  };

  // Fallback receiver resolver if no transaction is linked
  const getFallbackReceiver = (part: SparePart, day: number) => {
    if (receivers.length === 0) {
      return {
        name: language === 'id' ? 'Teknisi Pabrik' : 'Thợ máy phân xưởng',
        code: 'TM-01',
        workshop: language === 'id' ? 'Gedung A' : 'Xưởng A',
        department: language === 'id' ? 'Pemeliharaan Mesin Jahit' : 'Bảo trì máy May'
      };
    }
    const idx = (part.part_name.length + day) % receivers.length;
    return receivers[idx];
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP SECTION: 4 KPI Summary Cards matching image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Danh Mục */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.kpiTotalCategories}
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {parts.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t.kpiPartsUnit}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Tổng Nhập (Masuk) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
              {t.kpiTotalReceived}
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-black text-purple-700 font-mono">
                +{totalMasuk}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Tổng Xuất (Keluar) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">
              {t.kpiTotalIssued}
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-black text-orange-700 font-mono">
                -{totalKeluar}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Cảnh Báo Stock Limit */}
        <div className={`bg-white border rounded-xl p-4 shadow-xs flex items-center justify-between ${
          countStockLimit > 0 ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'
        }`}>
          <div>
            <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
              {t.kpiStockLimitAlert}
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className={`text-2xl font-black font-mono ${countStockLimit > 0 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                {countStockLimit}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t.kpiItemsUnit}
              </span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            countStockLimit > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. SUBHEADER: SỔ NHẬP - XUẤT TRONG [ Tháng 10/2026 ] + Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Title: Blue text on white background */}
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{t.subHeaderTitle}</span>
              <span className="text-[#1D46B6] bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs font-mono font-bold">
                {language === 'id' ? `Bulan ${month}/${year}` : `Tháng ${month}/${year}`}
              </span>
            </h2>
          </div>

          {/* Right Action Controls: Sổ Xuất, Sổ Nhập, Hôm nay, In Phiếu */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sổ Xuất Button */}
            <button
              type="button"
              onClick={() => setViewMode('OUT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'OUT'
                  ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-300 animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700 border border-slate-200'
              }`}
            >
              <ArrowUpFromLine className="w-3.5 h-3.5" />
              <span>{t.btnStockOut}</span>
            </button>

            {/* Sổ Nhập Button */}
            <button
              type="button"
              onClick={() => setViewMode('IN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'IN'
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300 animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200'
              }`}
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>{t.btnStockIn}</span>
            </button>

            {/* Jump to Today Button */}
            {isCurrentMonth && currentDay > 0 && (
              <button
                type="button"
                onClick={() => setSelectedDayFocus(currentDay)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.btnToday}: {currentDay}</span>
              </button>
            )}

            {/* In Phiếu Kiểm Kê Button */}
            <button
              type="button"
              onClick={() => onOpenPrint(viewMode)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2C5A9E] hover:bg-[#234A83] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.btnPrintSheet}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. UNIFIED MASTER TABLE: 8 Columns Left-to-Right */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-xs text-left border-collapse select-none">
            {/* Table Header - Softer Blue Palette */}
            <thead className="sticky top-0 z-20 text-[11px] font-bold tracking-wider text-white shadow-sm" style={{ backgroundColor: '#2C5A9E' }}>
              {/* Row 1 Header in Sentence Case */}
              <tr>
                {/* 1. No. */}
                <th rowSpan={2} className="py-2 px-2 text-center align-middle border-r border-blue-300/30 w-10">
                  {t.colNo}
                </th>

                {/* 2. Danh mục */}
                <th rowSpan={2} className="py-2 px-2.5 align-middle border-r border-blue-300/30 w-[110px] min-w-[100px] max-w-[120px]">
                  {t.colCategory}
                </th>

                {/* 3. Tên phụ tùng & vị trí */}
                <th rowSpan={2} className="py-2 px-3 align-middle border-r border-blue-300/30 min-w-[190px]">
                  {t.colPartNameLocation}
                </th>

                {/* 4. Mã máy & hãng */}
                <th rowSpan={2} className="py-2 px-2.5 align-middle border-r border-blue-300/30 min-w-[110px]">
                  {t.colMachineBrand}
                </th>

                {/* 5. Trạng thái */}
                <th rowSpan={2} className="py-2 px-1 text-center align-middle border-r border-blue-300/30 w-14">
                  {t.colStatus}
                </th>

                {/* 6. Cân đối tồn kho thời gian thực */}
                <th colSpan={4} className="py-1 px-1 text-center border-b border-r border-blue-300/30 bg-[#244980]">
                  {t.colRealtimeBalance}
                </th>

                {/* 7. Sổ Theo Dõi Nhập-Xuất Trong Tháng (1..31) */}
                <th colSpan={31} className="py-1 px-2 text-center border-b border-r border-blue-300/30 bg-[#1F4174]">
                  {viewMode === 'OUT' ? t.colDailyLogTitleOut : t.colDailyLogTitleIn}
                </th>

                {/* 8. Thao Tác (Chỉnh sửa & Xóa) */}
                <th rowSpan={2} className="py-2 px-2 text-center align-middle w-24">
                  {t.colActions}
                </th>
              </tr>

              {/* Row 2 Sub-Headers */}
              <tr className="text-[10px] bg-[#315F9E]">
                {/* 6. Sub-columns: Tồn Đầu, Nhập, Xuất, Tồn Cuối - Chia đều tuyệt đối w-[46px], không có chữ Bật */}
                <th className="py-1 px-0.5 text-center border-r border-blue-300/30 w-[46px] min-w-[46px] max-w-[46px] font-bold" title={t.colBeginningStock}>
                  {t.colBeginningStock}
                </th>

                <th className={`py-1 px-0.5 text-center border-r border-blue-300/30 w-[46px] min-w-[46px] max-w-[46px] font-bold ${
                  viewMode === 'IN' ? 'bg-[#F5D0FE] text-purple-950 font-black' : ''
                }`} title={t.colReceived}>
                  {t.colReceived}
                </th>

                <th className={`py-1 px-0.5 text-center border-r border-blue-300/30 w-[46px] min-w-[46px] max-w-[46px] font-bold ${
                  viewMode === 'OUT' ? 'bg-[#FED7AA] text-orange-950 font-black' : ''
                }`} title={t.colIssued}>
                  {t.colIssued}
                </th>

                <th className="py-1 px-0.5 text-center border-r border-blue-300/30 w-[46px] min-w-[46px] max-w-[46px] font-bold bg-emerald-700/80 text-white" title={t.colEndingStock}>
                  {t.colEndingStock}
                </th>

                {/* 7. Sub-columns: 31 Days Header */}
                {daysMetadata.map((d) => (
                  <th
                    key={d.day}
                    className={`py-1 px-0.5 text-center border-r border-blue-400/25 w-[33px] min-w-[33px] ${
                      !d.isValid
                        ? 'opacity-30 bg-blue-950/60'
                        : d.isToday
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : d.isSunday
                        ? 'bg-rose-600/70 text-rose-100'
                        : d.isSaturday
                        ? 'bg-blue-600/70 text-blue-100'
                        : ''
                    }`}
                  >
                    <div className="leading-tight font-mono">{d.day}</div>
                    <div className="text-[8.5px] opacity-80 leading-tight">{d.name}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 bg-white">
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={40} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">{t.noPartsFound}</p>
                  </td>
                </tr>
              ) : (
                parts.map((part, index) => {
                  const logKey = `${monthKey}_${part.id}`;
                  const log = inventoryLogs[logKey] || {
                    id: logKey,
                    month_key: monthKey,
                    part_id: part.id,
                    beginning_stock: 0,
                    received_in_month: 0,
                    daily_issues: {},
                    daily_receives: {},
                    total_issue: 0,
                    current_stock: 0
                  };

                  const isStockLimit = log.current_stock <= part.min_limit;
                  const loc = locMap.get(part.location_id);
                  const mainCatName = (part.main_cat_id && catMap.get(part.main_cat_id)) || '-';
                  const subCatName = (part.sub_cat_id && catMap.get(part.sub_cat_id)) || '-';

                  return (
                    <tr
                      key={part.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                      }`}
                    >
                      {/* 1. No. */}
                      <td className="py-2 px-1 text-center align-middle font-mono text-slate-400 text-xs border-r border-slate-200">
                        {index + 1}
                      </td>

                      {/* 2. Danh Mục (Sổ A & Sổ B) - 2 dòng gọn gàng */}
                      <td className="py-1.5 px-2 align-middle border-r border-slate-200 w-[110px] min-w-[100px] max-w-[120px]">
                        <div className="font-semibold text-slate-800 text-[11px] leading-tight truncate">
                          {categoryKeyword && mainCatName.toUpperCase().includes(categoryKeyword) ? (
                            <span className="text-red-600 underline font-black">{mainCatName}</span>
                          ) : (
                            <span>{mainCatName}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 lowercase leading-tight truncate mt-0.5" title={subCatName}>
                          {subCatName}
                        </div>
                      </td>

                      {/* 3. Tên Phụ Tùng + Vị Trí - Đúng 2 dòng */}
                      <td className="py-1.5 px-2.5 align-middle border-r border-slate-200 min-w-[190px]">
                        {/* Dòng 1: Tên phụ tùng */}
                        <div className="font-bold text-slate-900 text-xs truncate max-w-[240px]" title={part.part_name}>
                          {part.part_name}
                        </div>
                        {/* Dòng 2: ĐVT; Min; LOC */}
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 truncate">
                          <span>{t.unitLabel}: <strong className="text-slate-700">{part.unit}</strong></span>
                          <span>·</span>
                          <span>{t.minLimitLabel}: <strong className="text-slate-700">{part.min_limit}</strong></span>
                          <span>·</span>
                          <span>LOC: <strong className="text-slate-700 font-mono">{loc?.barcode || part.location_id}</strong></span>
                        </div>
                      </td>

                      {/* 4. Mã Máy & Hãng */}
                      <td className="py-1.5 px-2.5 align-middle border-r border-slate-200 min-w-[110px]">
                        <div className="font-bold text-slate-900 text-xs font-mono">
                          {part.machine_code || '-'}
                        </div>
                        <div className="text-[10.5px] text-slate-500 mt-0.5">
                          {part.machine_brand || '-'}
                        </div>
                      </td>

                      {/* 5. Trạng Thái (Compact LIMIT / AMAN) */}
                      <td className="py-1.5 px-1 text-center align-middle border-r border-slate-200 w-14">
                        {isStockLimit ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase bg-red-100 text-red-700 border border-red-300 animate-pulse">
                            {t.statusLimit}
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {t.statusSafe}
                          </span>
                        )}
                      </td>

                      {/* 6. CÂN ĐỐI TỒN KHO THỜI GIAN THỰC - 4 Cột chia đều bằng nhau */}
                      {/* Tồn Đầu - Centered */}
                      <td className="py-1.5 px-0.5 text-center align-middle font-mono font-bold text-slate-800 border-r border-slate-200 w-[46px] min-w-[46px] max-w-[46px]">
                        {log.beginning_stock}
                      </td>

                      {/* Nhập - Centered */}
                      <td className={`py-1.5 px-0.5 text-center align-middle font-mono font-bold border-r border-purple-200 w-[46px] min-w-[46px] max-w-[46px] ${
                        viewMode === 'IN'
                          ? 'bg-[#F5D0FE] text-purple-950 font-black'
                          : 'bg-[#F5D0FE]/40 text-purple-950'
                      }`}>
                        {log.received_in_month > 0 ? `+${log.received_in_month}` : '0'}
                      </td>

                      {/* Xuất - Centered */}
                      <td className={`py-1.5 px-0.5 text-center align-middle font-mono font-bold border-r border-orange-200 w-[46px] min-w-[46px] max-w-[46px] ${
                        viewMode === 'OUT'
                          ? 'bg-[#FED7AA] text-orange-950 font-black'
                          : 'bg-[#FED7AA]/40 text-orange-950'
                      }`}>
                        {log.total_issue > 0 ? `-${log.total_issue}` : '0'}
                      </td>

                      {/* Tồn Cuối - Centered */}
                      <td className={`py-1.5 px-0.5 text-center align-middle font-mono font-bold border-r border-emerald-200 bg-[#BBF7D0]/50 w-[46px] min-w-[46px] max-w-[46px] ${
                        isStockLimit ? 'text-red-700 underline font-black animate-pulse' : 'text-emerald-950'
                      }`}>
                        {log.current_stock}
                      </td>

                      {/* 7. SỔ THEO DÕI NHẬP-XUẤT TRONG THÁNG (31 Days) */}
                      {daysMetadata.map((d) => {
                        if (!d.isValid) {
                          return (
                            <td
                              key={d.day}
                              className="py-1 px-1 text-center align-middle bg-slate-100/60 border-r border-slate-200 text-slate-300"
                            >
                              -
                            </td>
                          );
                        }

                        const dayKey = `day_${d.day}`;
                        const val = viewMode === 'OUT'
                          ? (log.daily_issues?.[dayKey] ?? 0)
                          : (log.daily_receives?.[dayKey] ?? 0);

                        const hasVal = typeof val === 'number' && val > 0;
                        const displayVal = hasVal ? String(val) : '';

                        // Cell color:
                        // OUT with value: Soft Blue [#BFDBFE]
                        // IN with value: Soft Pink [#F5D0FE]
                        let cellBg = '';
                        if (hasVal) {
                          cellBg = viewMode === 'OUT' ? 'bg-[#BFDBFE]' : 'bg-[#F5D0FE]';
                        } else if (d.isToday) {
                          cellBg = viewMode === 'OUT' ? 'bg-blue-50/60' : 'bg-purple-50/60';
                        } else if (d.isSunday) {
                          cellBg = 'bg-rose-50/50';
                        } else if (d.isSaturday) {
                          cellBg = 'bg-slate-100/70';
                        }

                        return (
                          <td
                            key={d.day}
                            onMouseEnter={(e) => {
                              if (hasVal) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredCell({
                                  part,
                                  day: d.day,
                                  val,
                                  mode: viewMode,
                                  rect
                                });
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredCell(null);
                            }}
                            className={`p-0 text-center align-middle border-r border-slate-200 relative ${cellBg}`}
                          >
                            <input
                              type="number"
                              min={0}
                              placeholder=""
                              value={displayVal}
                              onChange={(e) => {
                                if (viewMode === 'OUT') {
                                  handleDailyIssueChange(part.id, d.day, e.target.value);
                                } else {
                                  handleDailyReceiveChange(part.id, d.day, e.target.value);
                                }
                              }}
                              className={`w-full h-8 text-center align-middle text-xs font-mono transition-colors focus:outline-none focus:ring-2 ${
                                viewMode === 'OUT' ? 'focus:ring-blue-600' : 'focus:ring-purple-600'
                              } focus:bg-yellow-50 cursor-pointer ${
                                hasVal
                                  ? viewMode === 'OUT'
                                    ? 'font-bold text-blue-950 bg-[#BFDBFE]'
                                    : 'font-bold text-purple-950 bg-[#F5D0FE]'
                                  : 'text-slate-400 bg-transparent'
                              }`}
                              style={{ textAlign: 'center' }}
                            />
                          </td>
                        );
                      })}

                      {/* 8. THAO TÁC (Sửa, Nhân bản, Xóa) */}
                      <td className="py-1 px-1.5 text-center align-middle border-l border-slate-200">
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEditPart(part)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title={t.actionEdit}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => onDuplicatePart(part)}
                            className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                            title={t.actionDuplicate}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeletePart(part)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title={t.actionDelete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer: TỔNG CỘNG */}
            <tfoot className="sticky bottom-0 z-10 bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300 shadow-md text-xs">
              <tr>
                <td colSpan={5} className="py-2.5 px-3 text-right uppercase border-r border-slate-300 font-bold">
                  {t.totalSumLabel} ({viewMode === 'OUT' ? t.btnStockOut : t.btnStockIn}):
                </td>

                {/* Total Tồn Đầu */}
                <td className="py-2.5 px-0.5 text-center align-middle font-mono font-bold text-slate-800 border-r border-slate-300 w-[46px] min-w-[46px] max-w-[46px]">
                  {parts.reduce((acc, p) => acc + (inventoryLogs[`${monthKey}_${p.id}`]?.beginning_stock || 0), 0)}
                </td>

                {/* Total Nhập */}
                <td className="py-2.5 px-0.5 text-center align-middle font-mono font-bold bg-[#F5D0FE]/70 text-purple-950 border-r border-purple-300 w-[46px] min-w-[46px] max-w-[46px]">
                  +{parts.reduce((acc, p) => acc + (inventoryLogs[`${monthKey}_${p.id}`]?.received_in_month || 0), 0)}
                </td>

                {/* Total Xuất */}
                <td className="py-2.5 px-0.5 text-center align-middle font-mono font-bold bg-[#FED7AA]/70 text-orange-950 border-r border-orange-300 w-[46px] min-w-[46px] max-w-[46px]">
                  -{parts.reduce((acc, p) => acc + (inventoryLogs[`${monthKey}_${p.id}`]?.total_issue || 0), 0)}
                </td>

                {/* Total Tồn Cuối */}
                <td className="py-2.5 px-0.5 text-center align-middle font-mono font-bold bg-[#BBF7D0]/70 text-emerald-950 border-r border-emerald-300 w-[46px] min-w-[46px] max-w-[46px]">
                  {parts.reduce((acc, p) => acc + (inventoryLogs[`${monthKey}_${p.id}`]?.current_stock || 0), 0)}
                </td>

                {/* Daily Totals 1..31 */}
                {daysMetadata.map((d) => {
                  const daySum = viewMode === 'OUT'
                    ? (dailyIssueTotals[`day_${d.day}`] || 0)
                    : (dailyReceiveTotals[`day_${d.day}`] || 0);

                  const activeColor = viewMode === 'OUT'
                    ? 'bg-blue-100 text-blue-950 font-bold'
                    : 'bg-[#F5D0FE] text-purple-950 font-bold';

                  return (
                    <td
                      key={d.day}
                      className={`py-2 px-0.5 text-center align-middle font-mono text-[11px] border-r border-slate-300 ${
                        daySum > 0
                          ? activeColor
                          : d.isWeekend
                          ? 'bg-slate-200/40 text-slate-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {d.isValid ? (daySum > 0 ? (viewMode === 'IN' ? `+${daySum}` : daySum) : '-') : ''}
                    </td>
                  );
                })}

                {/* Actions column footer */}
                <td className="py-2.5 px-1 text-center border-l border-slate-300 text-slate-400">
                  -
                </td>
              </tr>
            </tfoot>

          </table>
        </div>
      </div>

      {/* Floating Hover Tooltip: Hiển thị Người nhận hàng hoặc Thông tin nhập kho */}
      {hoveredCell && (
        <div
          style={{
            top: hoveredCell.rect.top < 220 
              ? `${hoveredCell.rect.bottom + 8}px` 
              : `${hoveredCell.rect.top - 8}px`,
            left: `${Math.min(window.innerWidth - 300, Math.max(16, hoveredCell.rect.left + hoveredCell.rect.width / 2 - 140))}px`,
            transform: hoveredCell.rect.top < 220 ? 'none' : 'translateY(-100%)'
          }}
          className="fixed z-50 pointer-events-none w-72 bg-slate-900/95 text-white rounded-xl shadow-2xl border border-slate-700/80 p-3 font-sans text-xs backdrop-blur-md animate-in fade-in duration-150"
        >
          {hoveredCell.mode === 'OUT' ? (
            (() => {
              const txs = transactions.filter(
                t => t.part_id === hoveredCell.part.id &&
                     t.month_key === monthKey &&
                     t.day === hoveredCell.day &&
                     t.type === 'OUT'
              );
              const fallbackRec = getFallbackReceiver(hoveredCell.part, hoveredCell.day);

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <ArrowUpFromLine className="w-4 h-4 text-orange-400" />
                      <span>{t.ttStockOutDay}: {hoveredCell.day}/{month}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      {hoveredCell.val} {hoveredCell.part.unit}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-200 leading-tight">
                    {hoveredCell.part.part_name}
                  </div>
                  {hoveredCell.part.machine_code && (
                    <div className="text-[10px] font-mono text-slate-400">
                      Máy: {hoveredCell.part.machine_code} {hoveredCell.part.machine_brand ? `(${hoveredCell.part.machine_brand})` : ''}
                    </div>
                  )}

                  {/* Recipient Details from Module 3 / Receivers */}
                  <div className="bg-slate-800/80 rounded-lg p-2 space-y-1.5 border border-slate-700/60 mt-1">
                    <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.ttRecipient}: {txs.length > 0 && txs[0].receiver_name ? txs[0].receiver_name : fallbackRec.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-blue-400" />
                        <span>{txs.length > 0 && txs[0].workshop ? txs[0].workshop : fallbackRec.workshop}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-amber-400" />
                        <span>{txs.length > 0 && txs[0].department ? txs[0].department : fallbackRec.department}</span>
                      </div>
                    </div>

                    {txs.length > 0 && txs[0].reason && (
                      <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-700/50">
                        {t.ttReason}: <span className="text-slate-200">{txs[0].reason}</span>
                      </div>
                    )}

                    {txs.length > 0 && txs[0].created_at && (
                      <div className="text-[9px] text-slate-400 font-mono">
                        {t.ttTime}: {new Date(txs[0].created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}

                    {txs.length > 1 && (
                      <div className="text-[9px] text-yellow-300 italic pt-0.5">
                        (+ Có {txs.length} lượt giao dịch trong ngày này)
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            (() => {
              const txs = transactions.filter(
                t => t.part_id === hoveredCell.part.id &&
                     t.month_key === monthKey &&
                     t.day === hoveredCell.day &&
                     t.type === 'IN'
              );

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300">
                      <ArrowDownToLine className="w-4 h-4 text-purple-400" />
                      <span>{t.ttStockInDay}: {hoveredCell.day}/{month}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-400/20 text-purple-200 border border-purple-400/30">
                      +{hoveredCell.val} {hoveredCell.part.unit}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-200 leading-tight">
                    {hoveredCell.part.part_name}
                  </div>
                  {hoveredCell.part.machine_code && (
                    <div className="text-[10px] font-mono text-slate-400">
                      Máy: {hoveredCell.part.machine_code} {hoveredCell.part.machine_brand ? `(${hoveredCell.part.machine_brand})` : ''}
                    </div>
                  )}

                  <div className="bg-slate-800/80 rounded-lg p-2 space-y-1 border border-slate-700/60 mt-1">
                    <div className="text-[11px] font-bold text-purple-300">
                      {txs.length > 0 && txs[0].supplier ? txs[0].supplier : 'Nhập bổ sung kho phụ tùng'}
                    </div>

                    {txs.length > 0 && txs[0].document_no && (
                      <div className="text-[10px] text-slate-300">
                        {t.ttDocNo}: <strong className="font-mono text-purple-200">{txs[0].document_no}</strong>
                      </div>
                    )}

                    {txs.length > 0 && txs[0].created_at && (
                      <div className="text-[9px] text-slate-400 font-mono">
                        {t.ttTime}: {new Date(txs[0].created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
