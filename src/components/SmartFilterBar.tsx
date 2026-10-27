import React from 'react';
import { Search, Filter, X, PlusCircle, AlertCircle, CheckCircle2, Plus, Settings } from 'lucide-react';
import { CategoryTreeItem, StorageLocation } from '../types/mro';
import { Language, translations } from '../i18n/translations';

export interface FilterState {
  searchQuery: string;
  mainCatId: string;
  subCatId: string;
  machineCode: string;
  machineBrand: string;
  locationGroup: string;
  statusFilter: 'ALL' | 'STOCK_LIMIT' | 'AMAN';
}

interface SmartFilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
  onOpenQuickAdd: (type: 'MAIN_CAT' | 'SUB_USE' | 'MACHINE_CODE' | 'MACHINE_BRAND' | 'LOCATION', parentId?: string) => void;
  onOpenManager?: (tab: 'MAIN_CAT' | 'SUB_USE' | 'MACHINE_CODE' | 'MACHINE_BRAND' | 'LOCATION') => void;
  stockLimitCount?: number;
  totalPartsCount?: number;
  language?: Language;
}

export const SmartFilterBar: React.FC<SmartFilterBarProps> = ({
  filters,
  onChange,
  categories,
  locations,
  onOpenQuickAdd,
  onOpenManager,
  stockLimitCount = 0,
  totalPartsCount = 0,
  language = 'vi'
}) => {
  const t = translations[language];
  // Main Categories (Type: MAIN_CAT)
  const mainCategories = categories.filter(c => c.type === 'MAIN_CAT');

  // Cascade: Sub-categories dependent on selected mainCatId
  const subCategories = categories.filter(c => {
    if (c.type !== 'SUB_USE') return false;
    if (!filters.mainCatId) return true;
    return c.parent_id === filters.mainCatId;
  });

  // Machine codes
  const machineCodes = categories.filter(c => c.type === 'MACHINE_CODE');

  // Machine brands
  const machineBrands = categories.filter(c => c.type === 'MACHINE_BRAND');

  // Unique Location Groups (A, B, C, D, G, K, B...)
  const locationGroups = Array.from(new Set(locations.map(l => l.group_code))).sort();

  const handleSearchChange = (val: string) => {
    onChange({ ...filters, searchQuery: val });
  };

  const handleMainCatChange = (catId: string) => {
    // When main category changes, reset subCatId if it doesn't belong to new main category
    onChange({
      ...filters,
      mainCatId: catId,
      subCatId: '' // Reset cascade child
    });
  };

  const handleClearFilters = () => {
    onChange({
      searchQuery: '',
      mainCatId: '',
      subCatId: '',
      machineCode: '',
      machineBrand: '',
      locationGroup: '',
      statusFilter: 'ALL'
    });
  };

  const hasActiveFilters = 
    Boolean(filters.searchQuery) ||
    Boolean(filters.mainCatId) ||
    Boolean(filters.subCatId) ||
    Boolean(filters.machineCode) ||
    Boolean(filters.machineBrand) ||
    Boolean(filters.locationGroup) ||
    filters.statusFilter !== 'ALL';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
      {/* Top Search-as-you-type input with quick counters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => onChange({ ...filters, statusFilter: 'ALL' })}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filters.statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterAll} ({totalPartsCount})
          </button>
          <button
            onClick={() => onChange({ ...filters, statusFilter: 'STOCK_LIMIT' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
              filters.statusFilter === 'STOCK_LIMIT'
                ? 'bg-red-500 text-white shadow-sm font-semibold'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t.filterLimit} ({stockLimitCount})</span>
          </button>
          <button
            onClick={() => onChange({ ...filters, statusFilter: 'AMAN' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
              filters.statusFilter === 'AMAN'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.filterSafe} ({Math.max(0, totalPartsCount - stockLimitCount)})</span>
          </button>
        </div>
      </div>

      {/* Cascade Filters & Inline Quick Add Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
        
        {/* Sổ A: Danh mục chính */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-700 truncate" title={t.mainCategory}>
              {t.mainCategory}
            </label>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onOpenQuickAdd('MAIN_CAT')}
                className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50 transition-colors"
                title="Thêm nhanh danh mục chính"
              >
                <Plus className="w-3 h-3" />
              </button>
              {onOpenManager && (
                <button
                  type="button"
                  onClick={() => onOpenManager('MAIN_CAT')}
                  className="text-slate-500 hover:text-slate-800 p-0.5 rounded hover:bg-slate-100 transition-colors"
                  title="Quản lý, Sửa & Xóa danh mục chính"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <select
              value={filters.mainCatId}
              onChange={(e) => {
                if (e.target.value === '__ADD_NEW__') {
                  onOpenQuickAdd('MAIN_CAT');
                } else if (e.target.value === '__MANAGE__') {
                  onOpenManager?.('MAIN_CAT');
                } else {
                  handleMainCatChange(e.target.value);
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white"
            >
              <option value="">{t.allMainCategories}</option>
              {mainCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
              <option value="__ADD_NEW__" className="font-semibold text-blue-600 bg-blue-50">
                ➕ Thêm nhanh...
              </option>
              <option value="__MANAGE__" className="font-semibold text-purple-700 bg-purple-50">
                ⚙️ Sửa & Xóa danh mục...
              </option>
            </select>
          </div>
        </div>

        {/* Sổ B: Loại sử dụng (Cascade theo Sổ A) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-700 truncate" title={t.subCategory}>
              {t.subCategory}
            </label>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onOpenQuickAdd('SUB_USE', filters.mainCatId || undefined)}
                className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50 transition-colors"
                title="Thêm nhanh loại sử dụng"
              >
                <Plus className="w-3 h-3" />
              </button>
              {onOpenManager && (
                <button
                  type="button"
                  onClick={() => onOpenManager('SUB_USE')}
                  className="text-slate-500 hover:text-slate-800 p-0.5 rounded hover:bg-slate-100 transition-colors"
                  title="Quản lý, Sửa & Xóa loại sử dụng"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <select
              value={filters.subCatId}
              onChange={(e) => {
                if (e.target.value === '__ADD_NEW__') {
                  onOpenQuickAdd('SUB_USE', filters.mainCatId || undefined);
                } else if (e.target.value === '__MANAGE__') {
                  onOpenManager?.('SUB_USE');
                } else {
                  onChange({ ...filters, subCatId: e.target.value });
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white"
            >
              <option value="">{t.allSubCategories}</option>
              {subCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
              <option value="__ADD_NEW__" className="font-semibold text-blue-600 bg-blue-50">
                ➕ Thêm nhanh...
              </option>
              <option value="__MANAGE__" className="font-semibold text-purple-700 bg-purple-50">
                ⚙️ Sửa & Xóa loại dùng...
              </option>
            </select>
          </div>
        </div>

        {/* Sổ C: Mã máy (Kode Mesin) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-700 truncate" title={t.machineCode}>
              {t.machineCode}
            </label>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onOpenQuickAdd('MACHINE_CODE')}
                className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50 transition-colors"
                title="Thêm nhanh mã máy"
              >
                <Plus className="w-3 h-3" />
              </button>
              {onOpenManager && (
                <button
                  type="button"
                  onClick={() => onOpenManager('MACHINE_CODE')}
                  className="text-slate-500 hover:text-slate-800 p-0.5 rounded hover:bg-slate-100 transition-colors"
                  title="Quản lý, Sửa & Xóa mã máy"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <select
              value={filters.machineCode}
              onChange={(e) => {
                if (e.target.value === '__ADD_NEW__') {
                  onOpenQuickAdd('MACHINE_CODE');
                } else if (e.target.value === '__MANAGE__') {
                  onOpenManager?.('MACHINE_CODE');
                } else {
                  onChange({ ...filters, machineCode: e.target.value });
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white"
            >
              <option value="">{t.allMachines}</option>
              {machineCodes.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code}
                </option>
              ))}
              <option value="__ADD_NEW__" className="font-semibold text-blue-600 bg-blue-50">
                ➕ Thêm nhanh...
              </option>
              <option value="__MANAGE__" className="font-semibold text-purple-700 bg-purple-50">
                ⚙️ Sửa & Xóa mã máy...
              </option>
            </select>
          </div>
        </div>

        {/* Hãng máy (Brand) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-700 truncate" title={t.machineBrand}>
              {t.machineBrand}
            </label>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onOpenQuickAdd('MACHINE_BRAND')}
                className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50 transition-colors"
                title="Thêm nhanh hãng máy"
              >
                <Plus className="w-3 h-3" />
              </button>
              {onOpenManager && (
                <button
                  type="button"
                  onClick={() => onOpenManager('MACHINE_BRAND')}
                  className="text-slate-500 hover:text-slate-800 p-0.5 rounded hover:bg-slate-100 transition-colors"
                  title="Quản lý, Sửa & Xóa hãng máy"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <select
              value={filters.machineBrand}
              onChange={(e) => {
                if (e.target.value === '__ADD_NEW__') {
                  onOpenQuickAdd('MACHINE_BRAND');
                } else if (e.target.value === '__MANAGE__') {
                  onOpenManager?.('MACHINE_BRAND');
                } else {
                  onChange({ ...filters, machineBrand: e.target.value });
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white"
            >
              <option value="">{t.allBrands}</option>
              {machineBrands.map((b) => (
                <option key={b.id} value={b.code || b.name}>
                  {b.code || b.name}
                </option>
              ))}
              <option value="__ADD_NEW__" className="font-semibold text-blue-600 bg-blue-50">
                ➕ Thêm nhanh...
              </option>
              <option value="__MANAGE__" className="font-semibold text-purple-700 bg-purple-50">
                ⚙️ Sửa & Xóa hãng máy...
              </option>
            </select>
          </div>
        </div>

        {/* Lọc vị trí: Khu/Kệ (G-K-B) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-700 truncate" title={t.storageLocation}>
              {t.storageLocation}
            </label>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onOpenQuickAdd('LOCATION')}
                className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50 transition-colors"
                title="Thêm nhanh vị trí kệ"
              >
                <Plus className="w-3 h-3" />
              </button>
              {onOpenManager && (
                <button
                  type="button"
                  onClick={() => onOpenManager('LOCATION')}
                  className="text-slate-500 hover:text-slate-800 p-0.5 rounded hover:bg-slate-100 transition-colors"
                  title="Quản lý, Sửa & Xóa vị trí kệ"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <select
              value={filters.locationGroup}
              onChange={(e) => {
                if (e.target.value === '__ADD_NEW__') {
                  onOpenQuickAdd('LOCATION');
                } else if (e.target.value === '__MANAGE__') {
                  onOpenManager?.('LOCATION');
                } else {
                  onChange({ ...filters, locationGroup: e.target.value });
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white"
            >
              <option value="">{t.allLocations}</option>
              {locationGroups.map((grp) => (
                <option key={grp} value={grp}>
                  Khu Kệ {grp}
                </option>
              ))}
              <option value="__ADD_NEW__" className="font-semibold text-blue-600 bg-blue-50">
                ➕ Thêm nhanh...
              </option>
              <option value="__MANAGE__" className="font-semibold text-purple-700 bg-purple-50">
                ⚙️ Sửa & Xóa vị trí kệ...
              </option>
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className={`w-full py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              hasActiveFilters
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>{t.clearFilters}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
