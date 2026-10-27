import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  AlertCircle,
  CheckCircle2,
  ArrowDownToLine,
  ArrowUpFromLine,
  User,
  Building,
  Wrench,
  Calendar,
  Layers,
  MapPin,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Plus
} from 'lucide-react';
import {
  SparePart,
  MonthlyInventoryLog,
  CategoryTreeItem,
  StorageLocation,
  ReceiverItem,
  WorkshopItem,
  DepartmentItem,
  StockTransaction
} from '../types/mro';
import { mroService } from '../services/mroStorage';
import { Language, translations } from '../i18n/translations';

interface StockInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: SparePart[];
  inventoryLogs: Record<string, MonthlyInventoryLog>;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
  receivers: ReceiverItem[];
  workshops: WorkshopItem[];
  departments: DepartmentItem[];
  monthKey: string; // e.g. "2026-10"
  onOpenManageReceivers?: () => void;
  language?: Language;
}

export const StockInOutModal: React.FC<StockInOutModalProps> = ({
  isOpen,
  onClose,
  parts,
  inventoryLogs,
  categories,
  locations,
  receivers,
  workshops,
  departments,
  monthKey,
  onOpenManageReceivers,
  language = 'vi'
}) => {
  const t = translations[language];
  // Parse month and year
  const [year, month] = useMemo(() => {
    const p = (monthKey || '2026-10').split('-').map(Number);
    return [p[0] || 2026, p[1] || 10];
  }, [monthKey]);

  // Days in month
  const daysInMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  // Default day to today if matching month, or 1
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
  const initialDay = isCurrentMonth ? Math.min(daysInMonth, Math.max(1, today.getDate())) : 1;

  // Filter States matching SmartFilterBar image
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'STOCK_LIMIT' | 'AMAN'>('ALL');
  const [mainCatId, setMainCatId] = useState('');
  const [subCatId, setSubCatId] = useState('');
  const [machineCode, setMachineCode] = useState('');
  const [machineBrand, setMachineBrand] = useState('');
  const [locationGroup, setLocationGroup] = useState('');

  // Selected Spare Part for Stock In/Out
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  // Transaction form state
  const [txType, setTxType] = useState<'IN' | 'OUT'>('OUT');
  const [txDay, setTxDay] = useState<number>(initialDay);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [docNo, setDocNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // 2-step confirmation state
  // null = no confirmation open, 'STEP_1' = first confirmation, 'STEP_2' = second confirmation
  const [confirmStep, setConfirmStep] = useState<null | 'STEP_1' | 'STEP_2'>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Quick Add receiver state
  const [isQuickAddReceiverOpen, setIsQuickAddReceiverOpen] = useState(false);
  const [quickReceiverName, setQuickReceiverName] = useState('');
  const [quickReceiverCode, setQuickReceiverCode] = useState('');
  const [quickReceiverWorkshop, setQuickReceiverWorkshop] = useState(workshops[0]?.name || 'Xưởng A');
  const [quickReceiverDept, setQuickReceiverDept] = useState(departments[0]?.name || 'Bảo trì máy May');

  // Filter Lookups
  const locMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);
  const mainCategories = useMemo(() => categories.filter(c => c.type === 'MAIN_CAT'), [categories]);
  const subCategories = useMemo(() => {
    return categories.filter(c => {
      if (c.type !== 'SUB_USE') return false;
      if (!mainCatId) return true;
      return c.parent_id === mainCatId;
    });
  }, [categories, mainCatId]);
  const machineCodes = useMemo(() => categories.filter(c => c.type === 'MACHINE_CODE'), [categories]);
  const machineBrands = useMemo(() => categories.filter(c => c.type === 'MACHINE_BRAND'), [categories]);
  const locationGroups = useMemo(() => Array.from(new Set(locations.map(l => l.group_code))).sort(), [locations]);

  // Filter parts list
  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const log = inventoryLogs[`${monthKey}_${part.id}`];
      const currentStock = log ? log.current_stock : 0;
      const isLimit = currentStock <= part.min_limit;

      if (statusFilter === 'STOCK_LIMIT' && !isLimit) return false;
      if (statusFilter === 'AMAN' && isLimit) return false;
      if (mainCatId && part.main_cat_id !== mainCatId) return false;
      if (subCatId && part.sub_cat_id !== subCatId) return false;
      if (machineCode && part.machine_code !== machineCode) return false;
      if (machineBrand && part.machine_brand !== machineBrand) return false;

      if (locationGroup) {
        const loc = locMap.get(part.location_id);
        if (!loc || loc.group_code !== locationGroup) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const loc = locMap.get(part.location_id);
        const locText = loc ? `${loc.barcode} ${loc.group_code} ${loc.note || ''}`.toLowerCase() : '';
        const match =
          part.id.toLowerCase().includes(q) ||
          part.part_name.toLowerCase().includes(q) ||
          (part.machine_code && part.machine_code.toLowerCase().includes(q)) ||
          (part.machine_brand && part.machine_brand.toLowerCase().includes(q)) ||
          locText.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [parts, inventoryLogs, monthKey, statusFilter, mainCatId, subCatId, machineCode, machineBrand, locationGroup, searchQuery, locMap]);

  // Counts for pills
  const stockLimitCount = useMemo(() => {
    return parts.filter(p => {
      const log = inventoryLogs[`${monthKey}_${p.id}`];
      return (log ? log.current_stock : 0) <= p.min_limit;
    }).length;
  }, [parts, inventoryLogs, monthKey]);

  const safeCount = parts.length - stockLimitCount;

  // Selected Part Object
  const selectedPart = useMemo(() => {
    if (!selectedPartId) return null;
    return parts.find(p => p.id === selectedPartId) || null;
  }, [selectedPartId, parts]);

  const selectedPartLog = useMemo(() => {
    if (!selectedPartId) return null;
    return inventoryLogs[`${monthKey}_${selectedPartId}`] || {
      beginning_stock: 0,
      received_in_month: 0,
      daily_issues: {},
      total_issue: 0,
      current_stock: 0
    };
  }, [selectedPartId, inventoryLogs, monthKey]);

  // Selected Receiver Object
  const selectedReceiver = useMemo(() => {
    if (!selectedReceiverId) return null;
    return receivers.find(r => r.id === selectedReceiverId) || null;
  }, [selectedReceiverId, receivers]);

  // Projected stock balance
  const currentStockVal = selectedPartLog ? selectedPartLog.current_stock : 0;
  const projectedStock = txType === 'IN'
    ? currentStockVal + quantity
    : currentStockVal - quantity;

  // Auto-select first part if none selected and results exist
  React.useEffect(() => {
    if (!selectedPartId && filteredParts.length > 0) {
      setSelectedPartId(filteredParts[0].id);
    }
  }, [filteredParts, selectedPartId]);

  if (!isOpen) return null;

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setMainCatId('');
    setSubCatId('');
    setMachineCode('');
    setMachineBrand('');
    setLocationGroup('');
  };

  const handleSelectPart = (part: SparePart, type?: 'IN' | 'OUT') => {
    setSelectedPartId(part.id);
    if (type) {
      setTxType(type);
    }
  };

  // Validation before opening confirmation step 1
  const handleInitiateSave = () => {
    if (!selectedPart) {
      alert('Vui lòng chọn 1 phụ tùng cần xuất/nhập.');
      return;
    }
    if (quantity <= 0 || isNaN(quantity)) {
      alert('Vui lòng nhập số lượng hợp lệ lớn hơn 0.');
      return;
    }
    if (txType === 'OUT' && !selectedReceiverId) {
      alert('Vui lòng chọn người thợ máy nhận phụ tùng xuất kho.');
      return;
    }
    // Open Confirmation 1
    setConfirmStep('STEP_1');
  };

  // Step 1 -> Step 2
  const handleConfirmStep1 = () => {
    setConfirmStep('STEP_2');
  };

  // Step 2 -> Final Save
  const handleFinalSave = async () => {
    if (!selectedPart) return;

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(txDay).padStart(2, '0')}`;
    const tx: StockTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: txType,
      part_id: selectedPart.id,
      month_key: monthKey,
      day: txDay,
      date: dateStr,
      quantity: quantity,
      receiver_id: txType === 'OUT' ? selectedReceiverId : undefined,
      receiver_name: txType === 'OUT' ? (selectedReceiver?.name || '') : undefined,
      workshop: txType === 'OUT' ? (selectedReceiver?.workshop || '') : undefined,
      department: txType === 'OUT' ? (selectedReceiver?.department || '') : undefined,
      reason: txType === 'OUT' ? reason : undefined,
      doc_no: txType === 'IN' ? docNo : undefined,
      notes: notes,
      created_at: new Date().toISOString()
    };

    const res = await mroService.recordStockInOut(tx);
    setConfirmStep(null);

    if (res.success) {
      const typeText = txType === 'IN' ? 'Nhập kho' : 'Xuất kho';
      setSaveSuccessMsg(`Đã ${typeText} thành công ${quantity} ${selectedPart.unit} cho phụ tùng [${selectedPart.id}]!`);
      // Reset quantity
      setQuantity(1);
      setReason('');
      setNotes('');
      setDocNo('');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Quick Add Receiver Handler
  const handleSaveQuickReceiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReceiverName.trim()) return;

    const nextId = `rec-${Date.now().toString().slice(-6)}`;
    const newRec: ReceiverItem = {
      id: nextId,
      name: quickReceiverName.trim(),
      code: quickReceiverCode.trim() || `TM-${String(receivers.length + 1).padStart(2, '0')}`,
      workshop: quickReceiverWorkshop,
      department: quickReceiverDept,
      active: true
    };

    await mroService.saveReceiver(newRec);
    setSelectedReceiverId(newRec.id);
    setIsQuickAddReceiverOpen(false);
    setQuickReceiverName('');
    setQuickReceiverCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
      {/* Main Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1D46B6] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <ArrowDownToLine className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  XUẤT - NHẬP PHỤ TÙNG KHO MRO
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-black/25 rounded border border-white/20">
                  Tháng {month}/{year}
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Tìm kiếm phụ tùng · Thực hiện xuất/nhập trực tiếp · Cập nhật tồn kho tự động tức thì
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Toolbar (Identical layout to SmartFilterBar in user image) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          {/* Row 1: Search bar + Status Pills */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'id' ? 'Cari instan berdasarkan nama part, kode mesin (KM-250), lokasi rak A-01-01...' : 'Tìm kiếm tức thì theo tên phụ tùng, mã máy (KM-250), vị trí kệ A-01-01...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white border-blue-600 text-blue-700 shadow-2xs font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tất cả ({parts.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('STOCK_LIMIT')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                  statusFilter === 'STOCK_LIMIT'
                    ? 'bg-red-500 border-red-600 text-white shadow-2xs font-bold'
                    : 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Stock Limit ({stockLimitCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('AMAN')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                  statusFilter === 'AMAN'
                    ? 'bg-emerald-600 border-emerald-700 text-white shadow-2xs font-bold'
                    : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>An toàn ({safeCount})</span>
              </button>
            </div>
          </div>

          {/* Row 2: 5 Dropdown Filters + Clear Button */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-xs">
            {/* Sổ A */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                Sổ A: Danh mục chính
              </label>
              <select
                value={mainCatId}
                onChange={(e) => {
                  setMainCatId(e.target.value);
                  setSubCatId('');
                }}
                className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 focus:ring-1 focus:ring-blue-500 text-xs"
              >
                <option value="">-- Tất cả ngành --</option>
                {mainCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.code || c.name}</option>
                ))}
              </select>
            </div>

            {/* Sổ B */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                Sổ B: Loại sử dụng
              </label>
              <select
                value={subCatId}
                onChange={(e) => setSubCatId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 focus:ring-1 focus:ring-blue-500 text-xs"
              >
                <option value="">-- Tất cả loại dùng --</option>
                {subCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.code || c.name}</option>
                ))}
              </select>
            </div>

            {/* Sổ C */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                Sổ C: Mã máy (Kode)
              </label>
              <select
                value={machineCode}
                onChange={(e) => setMachineCode(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 focus:ring-1 focus:ring-blue-500 text-xs"
              >
                <option value="">-- Tất cả mã máy --</option>
                {machineCodes.map(c => (
                  <option key={c.id} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>

            {/* Hãng máy */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                Hãng máy (Brand)
              </label>
              <select
                value={machineBrand}
                onChange={(e) => setMachineBrand(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 focus:ring-1 focus:ring-blue-500 text-xs"
              >
                <option value="">-- Tất cả hãng máy --</option>
                {machineBrands.map(b => (
                  <option key={b.id} value={b.code || b.name}>{b.code || b.name}</option>
                ))}
              </select>
            </div>

            {/* Vị trí kệ */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
                Vị trí: Khu Kệ (G-K-B)
              </label>
              <select
                value={locationGroup}
                onChange={(e) => setLocationGroup(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 focus:ring-1 focus:ring-blue-500 text-xs"
              >
                <option value="">-- Tất cả khu kệ --</option>
                {locationGroups.map(grp => (
                  <option key={grp} value={grp}>Khu Kệ {grp}</option>
                ))}
              </select>
            </div>

            {/* Xóa bộ lọc */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full py-1 px-2.5 rounded-md text-xs font-semibold text-slate-600 bg-slate-200/80 hover:bg-slate-300 transition-colors flex items-center justify-center gap-1 cursor-pointer h-[26px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa bộ lọc</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area: Split 2 columns (Parts List on Left, In/Out Form on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column: Filtered Parts List (5/12 on large screens) */}
          <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-slate-50/50">
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Danh sách phụ tùng ({filteredParts.length} mục)
              </span>
              <span className="text-[11px] text-slate-500">
                Nhấp vào phụ tùng để thao tác
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 p-2 space-y-1.5">
              {filteredParts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy phụ tùng phù hợp với bộ lọc.
                </div>
              ) : (
                filteredParts.map((part) => {
                  const log = inventoryLogs[`${monthKey}_${part.id}`];
                  const currentStock = log ? log.current_stock : 0;
                  const isLimit = currentStock <= part.min_limit;
                  const loc = locMap.get(part.location_id);
                  const isSelected = selectedPartId === part.id;

                  return (
                    <div
                      key={part.id}
                      onClick={() => handleSelectPart(part)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {loc?.barcode || part.location_id}
                            </span>
                          </div>
                          <div className="font-bold text-xs text-slate-900 mt-1 truncate" title={part.part_name}>
                            {part.part_name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>Máy: {part.machine_code || '-'}</span>
                            <span>·</span>
                            <span>ĐVT: {part.unit}</span>
                          </div>
                        </div>

                        {/* Current Stock Badge */}
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Tồn kho</div>
                          <div className={`font-mono font-black text-sm ${
                            isLimit ? 'text-red-600' : 'text-emerald-700'
                          }`}>
                            {currentStock} {part.unit}
                          </div>
                          <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                            isLimit ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isLimit ? 'Cần mua' : 'An toàn'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Transaction Input Form (7/12 on large screens) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-y-auto p-5 bg-white space-y-4">
            {selectedPart ? (
              <>
                {/* Selected Part Banner */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {selectedPart.part_name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>Vị trí: <strong className="text-slate-700 font-mono">{locMap.get(selectedPart.location_id)?.barcode || selectedPart.location_id}</strong></span>
                        <span>·</span>
                        <span>ĐVT: <strong className="text-slate-700">{selectedPart.unit}</strong></span>
                        <span>·</span>
                        <span>Tồn Min: <strong className="text-slate-700">{selectedPart.min_limit}</strong></span>
                      </div>
                    </div>

                    <div className="text-right bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs shrink-0">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Tồn hiện tại</div>
                      <div className={`text-base font-black font-mono ${
                        currentStockVal <= selectedPart.min_limit ? 'text-red-600' : 'text-emerald-700'
                      }`}>
                        {currentStockVal} <span className="text-xs font-normal text-slate-500">{selectedPart.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Type Segmented Switcher */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                    {t.selectTxType}:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTxType('OUT')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        txType === 'OUT'
                          ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-400 animate-pulse'
                          : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700 border border-slate-200'
                      }`}
                    >
                      <ArrowUpFromLine className="w-4 h-4" />
                      <span>{t.btnTxOut}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTxType('IN')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        txType === 'IN'
                          ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400 animate-pulse'
                          : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200'
                      }`}
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>{t.btnTxIn}</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="space-y-3.5 bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                  {/* Row: Date + Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Day selector */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ngày thực hiện (Trong tháng {month}/{year})</span>
                      </label>
                      <select
                        value={txDay}
                        onChange={(e) => setTxDay(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            Ngày {d}/{month}/{year} {d === today.getDate() && isCurrentMonth ? '(Hôm nay)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Số lượng {txType === 'IN' ? 'nhập' : 'xuất'} ({selectedPart.unit}):
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 text-center focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(q => q + 1)}
                          className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => q + 5)}
                          className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => q + 10)}
                          className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Warning if issue exceeds stock */}
                  {txType === 'OUT' && quantity > currentStockVal && (
                    <div className="p-2.5 bg-red-50 border border-red-300 rounded-lg text-xs text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>
                        Cảnh báo: Số lượng xuất (<strong>{quantity}</strong>) vượt quá tồn kho hiện có (<strong>{currentStockVal}</strong>)!
                      </span>
                    </div>
                  )}

                  {/* SPECIFIC FIELDS FOR XUẤT KHO: Người thợ máy nhận hàng */}
                  {txType === 'OUT' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-orange-600" />
                            <span>Người thợ máy nhận phụ tùng <span className="text-red-500">*</span>:</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsQuickAddReceiverOpen(true)}
                              className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Thêm thợ máy mới</span>
                            </button>
                            {onOpenManageReceivers && (
                              <button
                                type="button"
                                onClick={onOpenManageReceivers}
                                className="text-[11px] font-semibold text-purple-700 hover:underline"
                              >
                                Quản lý danh bạ thợ
                              </button>
                            )}
                          </div>
                        </div>

                        <select
                          value={selectedReceiverId}
                          onChange={(e) => setSelectedReceiverId(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">-- Chọn người thợ máy nhận hàng --</option>
                          {receivers.map((rec) => (
                            <option key={rec.id} value={rec.id}>
                              {rec.name} ({rec.code || 'Thợ máy'}) · {rec.workshop} - {rec.department}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Receiver Highlight Badge Card */}
                      {selectedReceiver && (
                        <div className="p-3 bg-white border border-orange-200 rounded-xl shadow-2xs flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">
                              {selectedReceiver.code || 'TM'}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900">
                                {selectedReceiver.name}
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5">
                                <span className="bg-slate-100 px-1.5 py-0.2 rounded border font-semibold text-slate-700">
                                  {selectedReceiver.workshop}
                                </span>
                                <span>Bộ phận: <strong>{selectedReceiver.department}</strong></span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Đã xác thực
                          </span>
                        </div>
                      )}

                      {/* Reason / Machine code note */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Mục đích sử dụng / Mã máy thay thế (Tùy chọn):
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Thay thế cho máy may KM-250 chuyền 4, sửa lỗi đứt chỉ..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* SPECIFIC FIELDS FOR NHẬP KHO */}
                  {txType === 'IN' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Số chứng từ / Phiếu giao hàng / PO:
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: PO-2026-1025 / PNK-084"
                            value={docNo}
                            onChange={(e) => setDocNo(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Ghi chú nhập kho:
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Hàng nhập mới từ hãng JUKI, lô đợt 2..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Projected Balance Card */}
                  <div className="p-3 bg-white border border-slate-300 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Biến động tồn: </span>
                      <strong className="font-mono text-slate-700">{currentStockVal}</strong>
                      <span className={`mx-1 font-bold ${txType === 'IN' ? 'text-purple-600' : 'text-orange-600'}`}>
                        {txType === 'IN' ? `+${quantity}` : `-${quantity}`}
                      </span>
                      <span>=</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">Tồn sau giao dịch:</span>
                      <span className={`font-mono font-black text-sm ${
                        projectedStock <= selectedPart.min_limit ? 'text-red-600 underline' : 'text-emerald-700'
                      }`}>
                        {projectedStock} {selectedPart.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Đóng
                  </button>

                  <button
                    type="button"
                    onClick={handleInitiateSave}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                      txType === 'IN'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>LƯU DỮ LIỆU {txType === 'IN' ? 'NHẬP KHO' : 'XUẤT KHO'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                <Layers className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Chưa chọn phụ tùng nào</p>
                <p className="text-xs">Vui lòng nhấp vào một phụ tùng từ danh sách bên trái để thực hiện xuất hoặc nhập kho.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* QUICK ADD RECEIVER MODAL */}
      {isQuickAddReceiverOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-md p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>Thêm Nhanh Thợ Máy / Người Nhận Hàng</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickAddReceiverOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickReceiver} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Họ và tên người nhận <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Tuấn"
                  value={quickReceiverName}
                  onChange={(e) => setQuickReceiverName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mã số thợ / nhân viên:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: TM-07"
                  value={quickReceiverCode}
                  onChange={(e) => setQuickReceiverCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Xưởng (ABCDE):</label>
                  <select
                    value={quickReceiverWorkshop}
                    onChange={(e) => setQuickReceiverWorkshop(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    {workshops.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bộ phận:</label>
                  <select
                    value={quickReceiverDept}
                    onChange={(e) => setQuickReceiverDept(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddReceiverOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Lưu & Chọn Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION STEP 1 MODAL (HỎI LẦN 1) */}
      {confirmStep === 'STEP_1' && selectedPart && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black">
                1/2
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.confirmStep1Title}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.confirmStep1Desc}
                </p>
              </div>
            </div>

            {/* Summary details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-sans">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">{t.selectTxType}:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-white ${
                  txType === 'IN' ? 'bg-purple-600' : 'bg-orange-600'
                }`}>
                  {txType === 'IN' ? t.btnTxIn : t.btnTxOut}
                </span>
              </div>

              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">{t.pmPartName}:</span>
                <strong className="text-slate-900 text-right max-w-[260px] truncate">{selectedPart.part_name}</strong>
              </div>

              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">{t.txQuantityLabel}:</span>
                <strong className="text-sm font-black font-mono text-slate-900">
                  {quantity} {selectedPart.unit}
                </strong>
              </div>

              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">{t.txDateLabel}:</span>
                <strong>{language === 'id' ? `Tgl ${txDay}/${month}/${year}` : `Ngày ${txDay}/${month}/${year}`}</strong>
              </div>

              {txType === 'OUT' && (
                <>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">{t.txRecipientLabel}:</span>
                    <strong className="text-orange-950 font-bold">
                      {selectedReceiver?.name} ({selectedReceiver?.code || 'TM'})
                    </strong>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">{t.ttWorkshop} & {t.ttDepartment}:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedReceiver?.workshop} · {selectedReceiver?.department}
                    </span>
                  </div>
                  {reason && (
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-slate-500">{t.txReasonLabel}:</span>
                      <span className="text-slate-800">{reason}</span>
                    </div>
                  )}
                </>
              )}

              {txType === 'IN' && docNo && (
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">{t.txDocNoLabel}:</span>
                  <span className="font-mono font-semibold text-slate-800">{docNo}</span>
                </div>
              )}

              <div className="flex justify-between pt-1 font-bold text-slate-800">
                <span>{language === 'id' ? `Stok saat ini: ${currentStockVal}` : `Tồn hiện tại: ${currentStockVal}`}</span>
                <span className="text-emerald-700">{language === 'id' ? `Stok baru perkiraan: ${projectedStock}` : `Tồn mới dự kiến: ${projectedStock}`}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              {t.confirmStep1Prompt}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmStep(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {t.btnCancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmStep1}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <span>{t.confirmBtnContinue}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION STEP 2 MODAL (HỎI LẦN 2 - CẢNH BÁO QUYẾT ĐỊNH) */}
      {confirmStep === 'STEP_2' && selectedPart && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-500 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-red-100 pb-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-600 font-black animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-red-700 uppercase tracking-tight">
                  {t.confirmStep2Title}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  {t.confirmStep2Desc}
                </p>
              </div>
            </div>

            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2 text-xs text-slate-800 leading-relaxed">
              <p className="font-bold text-red-900">
                {language === 'id' ? 'Sistem akan segera mencatat:' : 'Hệ thống sẽ thực hiện ngay:'}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>
                  {language === 'id' ? 'Mencatat ' : 'Ghi nhận '} 
                  <strong>{txType === 'IN' ? (language === 'id' ? 'MASUK' : 'NHẬP') : (language === 'id' ? 'KELUAR' : 'XUẤT')} {quantity} {selectedPart.unit}</strong> {language === 'id' ? 'untuk suku cadang ' : 'của phụ tùng '} 
                  <strong>{selectedPart.part_name}</strong> {language === 'id' ? 'pada ' : 'vào '} 
                  <strong>{language === 'id' ? `Tgl ${txDay}/${month}/${year}` : `Ngày ${txDay}/${month}/${year}`}</strong>.
                </li>
                <li>
                  {language === 'id' 
                    ? 'Otomatis sinkron dan memperbarui stok pada Module 1 dan seluruh laporan.' 
                    : 'Tự động nhảy số và cập nhật tức thì trên Module 1 (Báo Cáo Tổng Hợp) và sổ theo dõi.'}
                </li>
                {txType === 'OUT' && (
                  <li>
                    {language === 'id' ? 'Teknisi penerima barang: ' : 'Người thợ nhận hàng: '} 
                    <strong>{selectedReceiver?.name}</strong> ({selectedReceiver?.workshop} - {selectedReceiver?.department}).
                  </li>
                )}
                <li>
                  {language === 'id' 
                    ? 'Sinkronisasi real-time ke semua workstation di pabrik JS Boyolali.' 
                    : 'Đồng bộ thời gian thực đến tất cả máy trạm khác đang kết nối trong nhà máy JS Boyolali.'}
                </li>
              </ul>
            </div>

            <div className="text-center font-bold text-xs text-slate-800 py-1">
              {t.confirmStep2Prompt}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setConfirmStep('STEP_1')}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <span>←</span>
                <span>{t.confirmBtnBack}</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t.confirmBtnFinal}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
