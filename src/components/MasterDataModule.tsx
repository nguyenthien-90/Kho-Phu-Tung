import React from 'react';
import { ArrowLeftRight, PlusCircle, PackagePlus, ArrowDownToLine, ArrowUpFromLine, Sparkles, Layers } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface MasterDataModuleProps {
  onAddNewPart: () => void;
  onOpenStockInOut: () => void;
  language?: Language;
  totalParts?: number;
}

export const MasterDataModule: React.FC<MasterDataModuleProps> = ({
  onAddNewPart,
  onOpenStockInOut,
  language = 'vi',
  totalParts
}) => {
  const t = translations[language];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1D46B6] rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
          <Layers className="w-3.5 h-3.5" />
          <span>{t.tabModule2}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {t.m2Title}
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto">
          {t.m2Subtitle}
        </p>
      </div>

      {/* Two Balanced Square Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Card 1: Xuất - Nhập Phụ Tùng */}
        <button
          type="button"
          onClick={onOpenStockInOut}
          className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 aspect-square text-center cursor-pointer transform hover:-translate-y-1"
        >
          {/* Subtle Background Glow on Hover */}
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Icon Container */}
          <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-5 relative">
            <div className="flex items-center justify-center gap-1">
              <ArrowDownToLine className="w-6 h-6 text-purple-200" />
              <ArrowUpFromLine className="w-6 h-6 text-amber-200" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500" />
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-slate-900 group-hover:text-[#1D46B6] transition-colors mb-2">
            {t.cardStockInOutTitle}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
            {t.cardStockInOutDesc}
          </p>

          {/* Action indicator pill */}
          <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 group-hover:bg-[#1D46B6] group-hover:text-white transition-all">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Thao tác nhanh</span>
          </div>
        </button>

        {/* Card 2: + Thêm Phụ Tùng Mới */}
        <button
          type="button"
          onClick={onAddNewPart}
          className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 aspect-square text-center cursor-pointer transform hover:-translate-y-1"
        >
          {/* Subtle Background Glow on Hover */}
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Icon Container */}
          <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-5">
            <PackagePlus className="w-9 h-9" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
            {t.cardAddNewPartTitle}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
            {t.cardAddNewPartDesc}
          </p>

          {/* Action indicator pill */}
          <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Đăng ký mới</span>
          </div>
        </button>
      </div>

      {/* Footer Info Counter */}
      {totalParts !== undefined && (
        <div className="mt-8 text-center text-xs text-slate-400 font-medium">
          Đang quản lý hệ thống: <strong className="text-slate-600 font-mono">{totalParts}</strong> phụ tùng kỹ thuật MRO
        </div>
      )}
    </div>
  );
};
