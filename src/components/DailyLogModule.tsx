import React, { useState, useMemo } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  ArrowDownToLine,
  ArrowUpFromLine,
  User,
  Building,
  Wrench,
  FileText,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  SparePart,
  MonthlyInventoryLog,
  StorageLocation,
  StockTransaction,
  ReceiverItem
} from '../types/mro';
import { mroService } from '../services/mroStorage';

interface DailyLogModuleProps {
  monthKey: string;
  parts: SparePart[];
  inventoryLogs: Record<string, MonthlyInventoryLog>;
  locations: StorageLocation[];
  transactions?: StockTransaction[];
  receivers?: ReceiverItem[];
  onOpenPrint?: (mode: 'OUT' | 'IN') => void;
}

export const DailyLogModule: React.FC<DailyLogModuleProps> = ({
  monthKey,
  parts,
  inventoryLogs,
  locations,
  transactions = [],
  receivers = [],
  onOpenPrint
}) => {
  const [selectedDayFocus, setSelectedDayFocus] = useState<number | null>(null);

  // Toggle mode: 'OUT' = Sổ Xuất (Keluar), 'IN' = Sổ Nhập (Masuk)
  const [viewMode, setViewMode] = useState<'OUT' | 'IN'>('OUT');

  // Hover state for tooltip on number cells
  const [hoveredCell, setHoveredCell] = useState<{
    part: SparePart;
    day: number;
    val: number;
    mode: 'OUT' | 'IN';
    rect: DOMRect;
  } | null>(null);

  // Parse Year and Month
  const [year, month] = useMemo(() => {
    const p = monthKey.split('-').map(Number);
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
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
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
  }, [year, month, daysInMonth, currentDay]);

  // Handle cell change for Xuất kho (Keluar)
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

  // Handle cell change for Nhập kho (Masuk)
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

  // Calculate daily issue sums per day across all displayed parts
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

  // Calculate daily receive sums per day across all displayed parts
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

  const locMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);
  const receiverMap = useMemo(() => new Map(receivers.map(r => [r.id, r])), [receivers]);

  // Fallback receiver resolver if no transaction is linked
  const getFallbackReceiver = (part: SparePart, day: number) => {
    if (receivers.length === 0) {
      return {
        name: 'Thợ máy phân xưởng',
        code: 'TM-01',
        workshop: 'Xưởng A',
        department: 'Bảo trì máy May'
      };
    }
    // Select deterministic receiver based on part and day
    const idx = (part.part_name.length + day) % receivers.length;
    return receivers[idx];
  };

  return (
    <div className="space-y-4">
      {/* Module Header & Instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center h-8">
                MODULE 2: SỔ NHẬP - XUẤT TRONG
              </h2>
              <span className="px-2.5 h-8 flex items-center justify-center text-xs font-mono font-bold bg-[#1D46B6] text-white rounded-lg shadow-2xs">
                Tháng {month}/{year}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {viewMode === 'OUT' ? (
                <span>Đang xem: Sổ Theo Dõi Xuất Kho.</span>
              ) : (
                <span>Đang xem: Sổ Theo Dõi Nhập Kho.</span>
              )}
            </p>
          </div>

          {/* Controls: Mode Toggle, Quick Day Jump, Print */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Sổ Xuất / Sổ Nhập Toggle Pill Buttons */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('OUT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'OUT'
                    ? 'bg-[#FED7AA] text-orange-950 border border-orange-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Bật Sổ Theo Dõi Xuất Kho 31 Ngày (Keluar)"
              >
                <ArrowUpFromLine className="w-3.5 h-3.5 text-orange-700" />
                <span>Sổ Xuất (Keluar)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('IN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'IN'
                    ? 'bg-[#F5D0FE] text-purple-950 border border-purple-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Bật Sổ Theo Dõi Nhập Kho 31 Ngày (Masuk)"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-purple-700" />
                <span>Sổ Nhập (Masuk)</span>
              </button>
            </div>

            {isCurrentMonth && (
              <button
                onClick={() => setSelectedDayFocus(currentDay)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Hôm nay: Ngày {currentDay}</span>
              </button>
            )}

            {onOpenPrint && (
              <button
                onClick={() => onOpenPrint(viewMode)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#1D46B6] hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                title={`In phiếu kiểm kê ${viewMode === 'OUT' ? 'xuất' : 'nhập'} (Khổ giấy nằm ngang)`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Kiểm Kê</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main 31-Day Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left border-collapse text-xs">
            
            {/* Sticky Table Header */}
            <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 shadow-xs">
              
              {/* Row 1: Header groupings */}
              <tr className="border-b border-slate-200 text-center font-bold">
                <th colSpan={3} className="py-2 px-3 text-left border-r border-slate-300 bg-slate-200/90 text-slate-800">
                  THÔNG TIN PHỤ TÙNG (MASTER DATA)
                </th>
                <th colSpan={4} className="py-2 px-3 border-r border-slate-300 bg-slate-200/70 text-slate-800 text-center">
                  CÂN ĐỐI TỒN KHO THỜI GIAN THỰC
                </th>
                <th 
                  colSpan={31} 
                  className={`py-2 px-3 border-r border-slate-300 text-center transition-colors ${
                    viewMode === 'OUT'
                      ? 'bg-blue-50 text-blue-900'
                      : 'bg-[#FDF4FF] text-purple-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-black text-sm tracking-wide">
                      {viewMode === 'OUT'
                        ? 'SỔ THEO DÕI XUẤT 31 NGÀY TRONG THÁNG (DAILY ISSUE 1 → 31)'
                        : 'SỔ THEO DÕI NHẬP 31 NGÀY TRONG THÁNG (DAILY ISSUE 1 → 31)'}
                    </span>
                    <span 
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        viewMode === 'OUT' 
                          ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                          : 'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}
                    >
                      {viewMode === 'OUT' ? 'XUẤT KHO (KELUAR)' : 'NHẬP KHO (MASUK)'}
                    </span>
                  </div>
                </th>
              </tr>

              {/* Row 2: Detailed Columns Header */}
              <tr className="border-b border-slate-300 font-semibold text-slate-700">
                {/* Fixed Columns */}
                <th className="py-2 px-2 text-center align-middle w-8 border-r border-slate-300 bg-slate-100">
                  NO
                </th>
                <th className="py-2 px-3 min-w-[200px] align-middle border-r border-slate-300 bg-slate-100">
                  TÊN PHỤ TÙNG / VỊ TRÍ
                </th>

                {/* Live Balances - Centered TỒN ĐẦU, NHẬP, XUẤT, TỒN CUỐI */}
                <th className="py-2 px-2 text-center align-middle w-14 border-r border-slate-300 bg-slate-100" title="Tồn đầu kỳ (Akhir Bulan trước)">
                  TỒN ĐẦU
                </th>

                {/* NHẬP column: Hiển thị icon/badge BẬT khi đang xem Sổ Nhập */}
                <th 
                  className={`py-2 px-2 text-center align-middle w-14 border-r select-none ${
                    viewMode === 'IN'
                      ? 'bg-[#F5D0FE] text-purple-950 font-black border-purple-400 ring-1 ring-purple-400'
                      : 'bg-[#F5D0FE]/60 text-purple-950 font-bold border-purple-200'
                  }`}
                  title="Nhập trong tháng (Masuk)"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span>NHẬP</span>
                    {viewMode === 'IN' && (
                      <span className="text-[9px] bg-purple-700 text-white font-bold px-1 rounded scale-90 leading-tight mt-0.5">BẬT</span>
                    )}
                  </div>
                </th>

                {/* XUẤT column: Hiển thị icon/badge BẬT khi đang xem Sổ Xuất */}
                <th 
                  className={`py-2 px-2 text-center align-middle w-14 border-r select-none ${
                    viewMode === 'OUT'
                      ? 'bg-[#FED7AA] text-orange-950 font-black border-orange-400 ring-1 ring-orange-400'
                      : 'bg-[#FED7AA]/60 text-orange-950 font-bold border-orange-200'
                  }`}
                  title="Tổng xuất tháng (Keluar)"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span>XUẤT</span>
                    {viewMode === 'OUT' && (
                      <span className="text-[9px] bg-orange-700 text-white font-bold px-1 rounded scale-90 leading-tight mt-0.5">BẬT</span>
                    )}
                  </div>
                </th>

                <th className="py-2 px-2 text-center align-middle w-16 border-r border-emerald-300 bg-[#BBF7D0]/80 text-emerald-950 font-bold" title="Tồn cuối tháng (Unite)">
                  TỒN CUỐI
                </th>

                {/* 31 Day Columns */}
                {daysMetadata.map((d) => {
                  let headerBg = 'bg-slate-50 text-slate-700';
                  if (!d.isValid) {
                    headerBg = 'bg-slate-200/50 text-slate-400';
                  } else if (d.isToday) {
                    headerBg = viewMode === 'OUT' 
                      ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-500'
                      : 'bg-purple-600 text-white font-bold ring-2 ring-purple-500';
                  } else if (d.isSunday) {
                    headerBg = 'bg-rose-100 text-rose-800 font-bold';
                  } else if (d.isSaturday) {
                    headerBg = 'bg-slate-200 text-slate-700 font-bold';
                  }

                  return (
                    <th
                      key={d.day}
                      className={`py-1 px-1 text-center min-w-[34px] w-[34px] border-r border-slate-200 select-none ${headerBg}`}
                      title={d.isValid ? `Ngày ${d.day}/${month} (${d.name})` : 'Không có ngày này'}
                    >
                      <div className="text-[10px] leading-tight opacity-80">{d.name}</div>
                      <div className="text-xs font-mono font-bold">{d.day}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 font-mono">
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={38} className="py-8 text-center text-slate-400 font-sans">
                    Không tìm thấy phụ tùng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                parts.map((part, index) => {
                  const logKey = `${monthKey}_${part.id}`;
                  const log = inventoryLogs[logKey] || {
                    beginning_stock: 0,
                    received_in_month: 0,
                    daily_issues: {},
                    daily_receives: {},
                    total_issue: 0,
                    current_stock: 0
                  };

                  const isStockLimit = log.current_stock <= part.min_limit;
                  const loc = locMap.get(part.location_id);

                  return (
                    <tr
                      key={part.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isStockLimit ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* NO */}
                      <td className="py-1.5 px-2 text-center text-slate-500 border-r border-slate-200">
                        {index + 1}
                      </td>

                      {/* Part Name & Location */}
                      <td className="py-1.5 px-3 border-r border-slate-200 font-sans">
                        <div className="font-semibold text-slate-900 leading-tight truncate max-w-[240px]" title={part.part_name}>
                          {part.part_name}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                            {loc?.barcode || '-'}
                          </span>
                          <span>ĐVT: {part.unit}</span>
                          <span>Min: {part.min_limit}</span>
                        </div>
                      </td>

                      {/* TỒN ĐẦU (Awal) - Centered */}
                      <td className="py-1.5 px-1 text-center align-middle text-slate-700 border-r border-slate-200">
                        {log.beginning_stock}
                      </td>

                      {/* NHẬP (Masuk) - Centered */}
                      <td 
                        className={`py-1.5 px-1 text-center align-middle font-semibold border-r border-purple-200 ${
                          viewMode === 'IN' 
                            ? 'bg-[#F5D0FE] text-purple-950 font-black' 
                            : 'bg-[#F5D0FE]/40 text-purple-950'
                        }`}
                        title="Nhập trong tháng (Masuk)"
                      >
                        {log.received_in_month > 0 ? `+${log.received_in_month}` : '0'}
                      </td>

                      {/* XUẤT (Total issue) - Centered */}
                      <td 
                        className={`py-1.5 px-1 text-center align-middle font-bold border-r border-orange-200 ${
                          viewMode === 'OUT' 
                            ? 'bg-[#FED7AA] text-orange-950 font-black' 
                            : 'bg-[#FED7AA]/40 text-orange-950'
                        }`}
                        title="Tổng xuất tháng (Keluar)"
                      >
                        {log.total_issue > 0 ? `-${log.total_issue}` : '0'}
                      </td>

                      {/* TỒN CUỐI (Unite / Current stock) - Centered */}
                      <td
                        className={`py-1.5 px-1 text-center align-middle font-bold text-sm border-r border-emerald-200 bg-[#BBF7D0]/50 ${
                          isStockLimit ? 'text-red-700 underline font-black animate-pulse' : 'text-emerald-950'
                        }`}
                        title={isStockLimit ? 'DƯỚI MỨC TỒN TỐI THIỂU (STOCK LIMIT)' : 'TỒN AN TOÀN'}
                      >
                        {log.current_stock}
                      </td>

                      {/* 31 Day Cells - Dynamically handles XUẤT (Keluar) or NHẬP (Masuk) */}
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
                        
                        // In OUT mode: daily_issues
                        // In IN mode: daily_receives
                        const val = viewMode === 'OUT'
                          ? (log.daily_issues?.[dayKey] ?? 0)
                          : (log.daily_receives?.[dayKey] ?? 0);

                        const hasVal = typeof val === 'number' && val > 0;
                        const displayVal = hasVal ? String(val) : '';

                        // Styling:
                        // OUT mode with value: Blue/Green [#BFDBFE]
                        // IN mode with value: HỒNG (Pink / Purple) [#F5D0FE], identical to column NHẬP
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
                                viewMode === 'OUT'
                                  ? 'focus:ring-blue-600'
                                  : 'focus:ring-purple-600'
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

                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Sticky Table Footer: Total daily issues or receives per day */}
            <tfoot className="sticky bottom-0 z-10 bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300 shadow-md">
              <tr>
                <td colSpan={3} className="py-2.5 px-3 text-right uppercase border-r border-slate-300 text-xs align-middle">
                  TỔNG CỘNG ({viewMode === 'OUT' ? 'XUẤT' : 'NHẬP'}):
                </td>

                {/* Total TỒN ĐẦU - Centered */}
                <td className="py-2.5 px-1 text-center align-middle font-mono font-bold text-slate-800 border-r border-slate-300">
                  {parts.reduce((acc, p) => acc + (inventoryLogs[`${monthKey}_${p.id}`]?.beginning_stock || 0), 0)}
                </td>

                {/* Total NHẬP - Centered */}
                <td className="py-2.5 px-1 text-center align-middle font-mono font-bold bg-[#F5D0FE]/70 text-purple-950 border-r border-purple-300">
                  +{parts.reduce((acc, p) => acc + (inventoryLogs[`${monthKey}_${p.id}`]?.received_in_month || 0), 0)}
                </td>
                
                {/* Total XUẤT (Keluar) - Centered */}
                <td className="py-2.5 px-1 text-center align-middle font-mono font-bold bg-[#FED7AA]/70 text-orange-950 border-r border-orange-300">
                  -{parts.reduce((acc, p) => acc + (inventoryLogs[`${monthKey}_${p.id}`]?.total_issue || 0), 0)}
                </td>

                {/* Total TỒN CUỐI - Centered */}
                <td className="py-2.5 px-1 text-center align-middle font-mono font-bold bg-[#BBF7D0]/70 text-emerald-950 border-r border-emerald-300">
                  {parts.reduce((acc, p) => acc + (inventoryLogs[`${monthKey}_${p.id}`]?.current_stock || 0), 0)}
                </td>

                {/* Daily totals for days 1..31 */}
                {daysMetadata.map((d) => {
                  const daySum = viewMode === 'OUT' 
                    ? (dailyIssueTotals[`day_${d.day}`] || 0)
                    : (dailyReceiveTotals[`day_${d.day}`] || 0);

                  const activeColor = viewMode === 'OUT'
                    ? 'bg-orange-100 text-orange-900 font-bold'
                    : 'bg-[#F5D0FE] text-purple-950 font-bold border-purple-300';

                  return (
                    <td
                      key={d.day}
                      className={`py-2 px-0.5 text-center align-middle font-mono text-[11px] border-r border-slate-300 ${
                        !d.isValid
                          ? 'bg-slate-200/50 text-slate-400'
                          : daySum > 0
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
              </tr>
            </tfoot>

          </table>
        </div>
      </div>

      {/* Floating Hover Tooltip: Shows "Người nhận hàng" or Import Information */}
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
            /* Tooltip for Sổ Xuất (Keluar) - Hiển thị Người Nhận Hàng */
            (() => {
              // Look up transactions for this part and day
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
                      <span>XUẤT KHO: NGÀY {hoveredCell.day}/{month}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      {hoveredCell.val} {hoveredCell.part.unit}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-200 leading-tight">
                    {hoveredCell.part.part_name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Mã: {hoveredCell.part.id} {hoveredCell.part.machine_code ? `| Máy: ${hoveredCell.part.machine_code}` : ''}
                  </div>

                  {/* Recipient Details from Module 3 (or fallback) */}
                  <div className="bg-slate-800/80 rounded-lg p-2 space-y-1.5 border border-slate-700/60 mt-1">
                    <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Người nhận: {txs.length > 0 && txs[0].receiver_name ? txs[0].receiver_name : fallbackRec.name}</span>
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
                        Lý do / Máy: <span className="text-slate-200">{txs[0].reason}</span>
                      </div>
                    )}

                    {txs.length > 0 && txs[0].created_at && (
                      <div className="text-[9px] text-slate-400 font-mono">
                        Thời gian: {new Date(txs[0].created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}

                    {txs.length > 1 && (
                      <div className="text-[9px] text-yellow-300 italic pt-0.5">
                        (+ Có {txs.length} lượt nhận hàng khác nhau trong ngày này)
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            /* Tooltip for Sổ Nhập (Masuk) */
            (() => {
              const inTxs = transactions.filter(
                t => t.part_id === hoveredCell.part.id &&
                     t.month_key === monthKey &&
                     t.day === hoveredCell.day &&
                     t.type === 'IN'
              );

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-fuchsia-300">
                      <ArrowDownToLine className="w-4 h-4 text-fuchsia-400" />
                      <span>NHẬP KHO: NGÀY {hoveredCell.day}/{month}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-fuchsia-400/20 text-fuchsia-200 border border-fuchsia-400/30">
                      +{hoveredCell.val} {hoveredCell.part.unit}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-200 leading-tight">
                    {hoveredCell.part.part_name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Mã: {hoveredCell.part.id}
                  </div>

                  <div className="bg-slate-800/80 rounded-lg p-2 space-y-1 text-[10px] text-slate-300 border border-slate-700/60 mt-1">
                    <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Chứng từ: {inTxs.length > 0 && inTxs[0].doc_no ? inTxs[0].doc_no : `NK-${monthKey}-${String(hoveredCell.day).padStart(2, '0')}`}</span>
                    </div>
                    <div>
                      Đơn vị giao: <span className="text-slate-100">{inTxs.length > 0 && (inTxs[0].notes || inTxs[0].reason) ? (inTxs[0].notes || inTxs[0].reason) : 'Nhà cung cấp phụ tùng MRO'}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Ghi nhận: Ngày {hoveredCell.day}/{month}/{year}
                    </div>
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
