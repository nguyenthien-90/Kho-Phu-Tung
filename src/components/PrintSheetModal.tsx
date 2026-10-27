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

const DEFAULT_SIGNATURES = [
  { id: "sig-1", role: "Dibuat Oleh", name: "Muh Fuad Rusyadi", order: 1 },
  { id: "sig-2", role: "Pengawas", name: "Nguyen Nhat Tien", order: 2 },
  { id: "sig-3", role: "Petugas SO", name: "Atika Oktaviana", order: 3 },
  { id: "sig-4", role: "Menyetujui 1", name: "Mr. Kim Jong Sung", order: 4 },
  { id: "sig-5", role: "Menyetujui 2", name: "Mr. Cha Young Jun", order: 5 },
  { id: "sig-6", role: "Menyetujui 3", name: "Mr. Chung Hae Young", order: 6 },
];

interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: AppSettings;
  monthKey: string;
  parts: SparePart[];
  inventoryLogs: Record<string, MonthlyInventoryLog>;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
  selectedMainCatId?: string;
  language?: Language;
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  isOpen,
  onClose,
  settings,
  monthKey,
  parts,
  inventoryLogs,
  categories,
  locations,
  selectedMainCatId,
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

  const safeParts = useMemo(() => Array.isArray(parts) ? parts : [], [parts]);
  const safeLogs = useMemo(() => inventoryLogs || {}, [inventoryLogs]);
  const safeCategories = useMemo(() => Array.isArray(categories) ? categories : [], [categories]);
  const safeLocations = useMemo(() => Array.isArray(locations) ? locations : [], [locations]);

  const catMap = useMemo(() => new Map(safeCategories.map(c => [c.id, c.name])), [safeCategories]);
  const locMap = useMemo(() => new Map(safeLocations.map(l => [l.id, l])), [safeLocations]);

  // Selected Category Keyword (Requirement 3: Red & Underline)
  const selectedCat = useMemo(() => {
    return safeCategories.find(c => c && c.id === selectedMainCatId && c.type === 'MAIN_CAT');
  }, [safeCategories, selectedMainCatId]);

  const categoryKeyword = useMemo(() => {
    if (!selectedCat) return 'MRO';
    if (selectedCat.code) {
      return selectedCat.code.replace(/_/g, ' ').trim().toUpperCase();
    }
    return selectedCat.name ? selectedCat.name.replace(/\(.*?\)/g, '').trim().toUpperCase() : 'MRO';
  }, [selectedCat]);

  const signatures = useMemo(() => {
    if (settings?.signatures && Array.isArray(settings.signatures) && settings.signatures.length > 0) {
      return settings.signatures;
    }
    return DEFAULT_SIGNATURES;
  }, [settings]);

  if (!isOpen) return null;

  return (
    <div className="print-modal-container fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-full print:h-auto">
      {/* Modal Container */}
      <div className="print-modal-card bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-6xl overflow-hidden my-4 max-h-[92vh] flex flex-col print:border-none print:shadow-none print:rounded-none print:max-w-none print:max-h-none print:m-0 print:p-0 print:overflow-visible print:block print:w-full print:h-auto">
        
        {/* Controls Bar (Hidden during actual window.print()) */}
        <div className="print-controls-bar flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">
              Xem Trước Phiếu Kiểm Kê MRO
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
              <span>In Phiếu Ngay</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="print-paper-content p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible print:w-full print:block">
          
          {/* Header Title Block */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-black uppercase tracking-wide text-slate-900">
                  LAPORAN PENGENDALIAN STOK MRO - {settings?.factory_name || 'JS BOYOLALI'}
                </h1>
                
                {/* Kategori line: Only display when a specific category is selected in Sổ A */}
                {selectedCat && categoryKeyword ? (
                  <div className="text-sm font-bold text-slate-900 tracking-wide uppercase mt-1">
                    Kategori: STOK SPAREPART{' '}
                    <u 
                      className="text-red-600 font-black underline tracking-wider" 
                      style={{ color: 'red', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                    >
                      {categoryKeyword}
                    </u>{' '}
                    {settings?.factory_name || 'JS BOYOLALI'}
                  </div>
                ) : null}

                <p className="text-xs font-semibold text-slate-700 tracking-wider uppercase mt-0.5">
                  MRO SMART STOCK CONTROL SYSTEM · PT JS CORP BOYOLALI INDONESIA
                </p>
              </div>
              <div className="text-right text-xs text-slate-700 space-y-0.5 font-mono">
                <div>Kỳ kiểm kê: <strong>{monthKey}</strong></div>
                <div>Ngày cơ sở (기준일): <strong>{settings?.effective_date || '2026-10-01'}</strong></div>
                <div>Ngày kiểm kê (실사일자): <strong>{settings?.audit_date || '2026-10-31'}</strong></div>
              </div>
            </div>
          </div>

          {/* Ban Ký Duyệt (Header Signatures Stamp Grid) */}
          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase text-slate-700 mb-1.5">
              LEMBAR PENGESAHAN (BAN KÝ DUYỆT KIỂM KÊ KHO):
            </div>
            <div className="grid grid-cols-6 border border-slate-800 divide-x divide-slate-800 text-center text-xs">
              {signatures.map((sig) => (
                <div key={sig.id} className="flex flex-col">
                  <div className="bg-slate-100 font-bold text-[11px] py-1 px-1 border-b border-slate-800 text-slate-800 truncate">
                    {sig.role}
                  </div>
                  <div className="h-16 flex items-center justify-center text-slate-400 font-serif italic text-xs">
                    (Tanda Tangan)
                  </div>
                  <div className="border-t border-slate-800 py-1 px-1 font-bold text-slate-900 text-xs truncate bg-slate-50">
                    {sig.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Printable Table */}
          <table className="w-full text-left border-collapse border border-slate-800 text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-800 text-[10px]">
                <th className="py-1 px-1.5 border border-slate-800 text-center w-7">{t.colNo}</th>
                <th className="py-1 px-2 border border-slate-800">{language === 'id' ? 'Nama suku cadang' : 'Tên phụ tùng'}</th>
                <th className="py-1 px-2 border border-slate-800">{t.colCategory}</th>
                <th className="py-1 px-2 border border-slate-800">{language === 'id' ? 'Kode mesin' : 'Mã máy'}</th>
                <th className="py-1 px-2 border border-slate-800">{language === 'id' ? 'Merek' : 'Hãng máy'}</th>
                <th className="py-1 px-2 border border-slate-800">{language === 'id' ? 'Vị trí kệ' : 'Vị trí'}</th>
                <th className="py-1 px-1 border border-slate-800 text-center">{t.unitLabel}</th>
                <th className="py-1 px-2 border border-slate-800 text-right">{t.colBeginningStock}</th>
                <th className="py-1 px-2 border border-slate-800 text-right bg-purple-50">{t.colReceived}</th>
                <th className="py-1 px-2 border border-slate-800 text-right bg-orange-50">{t.colIssued}</th>
                <th className="py-1 px-2 border border-slate-800 text-right bg-emerald-50 font-bold">{t.colEndingStock}</th>
                <th className="py-1 px-2 border border-slate-800 text-right">{t.minLimitLabel}</th>
                <th className="py-1 px-1 border border-slate-800 text-center w-8">{t.colStatus}</th>
                <th className="py-1 px-2 border border-slate-800">{language === 'id' ? 'Ghi chú' : 'Ghi chú'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {safeParts.map((part, index) => {
                const log = safeLogs[`${monthKey}_${part.id}`] || {
                  beginning_stock: 0,
                  received_in_month: 0,
                  total_issue: 0,
                  current_stock: 0,
                  notes: ''
                };
                const isLimit = log.current_stock <= (part.min_limit || 0);
                const loc = locMap.get(part.location_id);
                const mainCat = catMap.get(part.main_cat_id) || part.main_cat_id;

                return (
                  <tr key={part.id} className="border-b border-slate-300 print:break-inside-avoid">
                    <td className="py-1 px-1.5 text-center border-r border-slate-800 text-[10px]">{index + 1}</td>
                    <td className="py-1 px-2 font-medium border-r border-slate-800">{part.part_name}</td>
                    <td className="py-1 px-2 border-r border-slate-800">{mainCat}</td>
                    <td className="py-1 px-2 font-mono border-r border-slate-800">{part.machine_code || '-'}</td>
                    <td className="py-1 px-2 border-r border-slate-800">{part.machine_brand || '-'}</td>
                    <td className="py-1 px-2 font-mono border-r border-slate-800">{loc?.barcode || part.location_id}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-800">{part.unit}</td>
                    <td className="py-1 px-2 text-right font-mono border-r border-slate-800">{log.beginning_stock}</td>
                    <td className="py-1 px-2 text-right font-mono border-r border-slate-800 bg-purple-50">+{log.received_in_month}</td>
                    <td className="py-1 px-2 text-right font-mono border-r border-slate-800 bg-orange-50">-{log.total_issue}</td>
                    <td className={`py-1 px-2 text-right font-mono font-bold border-r border-slate-800 bg-emerald-50 ${isLimit ? 'text-red-700 font-black' : ''}`}>
                      {log.current_stock}
                    </td>
                    <td className="py-1 px-2 text-right font-mono border-r border-slate-800">{part.min_limit}</td>
                    <td className="py-1 px-1 text-center border-r border-slate-800 whitespace-nowrap">
                      <span className={`inline-block w-4 h-4 leading-4 text-center rounded text-[9px] font-black ${
                        isLimit ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {isLimit ? 'L' : 'A'}
                      </span>
                    </td>
                    <td className="py-1 px-2 text-[10px] text-slate-600">{log.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-900 print:break-inside-avoid">
                <td colSpan={7} className="py-1.5 px-2 text-right border border-slate-800 uppercase">
                  {t.totalSumLabel}:
                </td>
                <td className="py-1.5 px-2 text-right font-mono border border-slate-800">
                  {safeParts.reduce((acc, p) => acc + (safeLogs[`${monthKey}_${p.id}`]?.beginning_stock || 0), 0)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono border border-slate-800 bg-purple-100">
                  +{safeParts.reduce((acc, p) => acc + (safeLogs[`${monthKey}_${p.id}`]?.received_in_month || 0), 0)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono border border-slate-800 bg-orange-100">
                  -{safeParts.reduce((acc, p) => acc + (safeLogs[`${monthKey}_${p.id}`]?.total_issue || 0), 0)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono border border-slate-800 bg-emerald-100 font-black">
                  {safeParts.reduce((acc, p) => acc + (safeLogs[`${monthKey}_${p.id}`]?.current_stock || 0), 0)}
                </td>
                <td className="py-1.5 px-2 text-right font-mono border border-slate-800">
                  {safeParts.reduce((acc, p) => acc + (p.min_limit || 0), 0)}
                </td>
                <td colSpan={2} className="py-1.5 px-2 text-center border border-slate-800 text-[10px]">
                  Phiếu đối chiếu xuất nhập tồn
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer note */}
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 print:break-inside-avoid">
            <span>In từ Hệ thống Quản lý MRO Thông Minh - JS Corp Boyolali</span>
            <span>Ngày in: {new Date().toLocaleString('vi-VN')}</span>
          </div>

        </div>

      </div>

      {/* Embedded Print Styling */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
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
          body > #root > div > *:not(.print-modal-container) {
            display: none !important;
          }
          .print-modal-container {
            position: static !important;
            inset: auto !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            overflow: visible !important;
          }
          .print-modal-card {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: white !important;
          }
          .print-paper-content {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }
          .print-controls-bar {
            display: none !important;
          }
          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};
