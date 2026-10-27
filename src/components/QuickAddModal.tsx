import React, { useState } from 'react';
import { X, Plus, Layers, MapPin, Cpu, Check } from 'lucide-react';
import { CategoryTreeItem, StorageLocation } from '../types/mro';
import { mroService } from '../services/mroStorage';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'MAIN_CAT' | 'SUB_USE' | 'MACHINE_CODE' | 'MACHINE_BRAND' | 'LOCATION';
  parentId?: string;
  categories: CategoryTreeItem[];
  onAdded: (newItemId: string) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  type,
  parentId,
  categories,
  onAdded
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState(parentId || '');
  
  // For Storage Location
  const [groupCode, setGroupCode] = useState('A');
  const [columnNo, setColumnNo] = useState(1);
  const [rowNo, setRowNo] = useState(1);
  const [locationNote, setLocationNote] = useState('');

  if (!isOpen) return null;

  const mainCategories = categories.filter(c => c.type === 'MAIN_CAT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'LOCATION') {
      const barcode = `LOC-${groupCode.toUpperCase()}-${String(columnNo).padStart(2, '0')}-${String(rowNo).padStart(2, '0')}`;
      const newLoc: StorageLocation = {
        id: `loc-${groupCode.toLowerCase()}-${columnNo}-${rowNo}-${Date.now().toString().slice(-4)}`,
        group_code: groupCode.toUpperCase(),
        column_no: columnNo,
        row_no: rowNo,
        barcode,
        note: locationNote
      };
      await mroService.saveLocation(newLoc);
      onAdded(newLoc.id);
      onClose();
      return;
    }

    const val = code.trim().toUpperCase();
    if (!val) return;

    const newCat: CategoryTreeItem = {
      id: `cat-${type.toLowerCase()}-${Date.now().toString().slice(-6)}`,
      parent_id: type === 'SUB_USE' ? (selectedParentId || parentId || null) : null,
      type,
      code: val,
      name: val
    };

    await mroService.saveCategory(newCat);
    onAdded(newCat.id);
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'MAIN_CAT':
        return 'Thêm nhanh Danh mục chính (A)';
      case 'SUB_USE':
        return 'Thêm nhanh Loại sử dụng (B)';
      case 'MACHINE_CODE':
        return 'Thêm nhanh Mã máy (C)';
      case 'MACHINE_BRAND':
        return 'Thêm nhanh Hãng máy (E)';
      case 'LOCATION':
        return 'Thêm nhanh Vị trí kệ hàng (G-K-B)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{getTitle()}</h3>
              <p className="text-[11px] text-slate-500">Cập nhật tức thì vào danh sách chọn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {type === 'LOCATION' ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Khu / Kệ (G)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                    placeholder="VD: A, B, G"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-center uppercase font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Số Cột (K)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={columnNo}
                    onChange={(e) => setColumnNo(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-center font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tầng / Hàng (B)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={rowNo}
                    onChange={(e) => setRowNo(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-center font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs text-blue-800 font-medium">Mã Barcode tự sinh:</span>
                <p className="text-sm font-mono font-bold text-blue-900 mt-0.5">
                  LOC-{groupCode.toUpperCase() || 'A'}-{String(columnNo).padStart(2, '0')}-{String(rowNo).padStart(2, '0')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mô tả kệ (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={locationNote}
                  onChange={(e) => setLocationNote(e.target.value)}
                  placeholder="VD: Kệ chứa phụ tùng JUKI 1 kim chuyền 3"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <>
              {type === 'SUB_USE' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Thuộc danh mục chính (Sổ A)
                  </label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn danh mục cha --</option>
                    {mainCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã Code danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={
                    type === 'MAIN_CAT'
                      ? 'VD: SEWING, LISTRIK, BOILER, MRO, PNEUMATIC...'
                      : type === 'SUB_USE'
                      ? 'VD: 1510, JARUM_SATU, SAMSAGO, 2210...'
                      : type === 'MACHINE_CODE'
                      ? 'VD: KM-250, DDL-8700, LH-3168...'
                      : 'VD: JUKI, BROTHER, SUNSTAR, PEGASUS, JACK...'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu & Thêm nhanh</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
