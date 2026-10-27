import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  Layers,
  MapPin,
  Cpu,
  Bookmark,
  Info,
  AlertCircle
} from 'lucide-react';
import { CategoryTreeItem, CategoryType, StorageLocation } from '../types/mro';
import { mroService } from '../services/mroStorage';

export type ManagerTabType = 'MAIN_CAT' | 'SUB_USE' | 'MACHINE_CODE' | 'MACHINE_BRAND' | 'LOCATION';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ManagerTabType;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'MAIN_CAT',
  categories,
  locations
}) => {
  const [activeTab, setActiveTab] = useState<ManagerTabType>(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setEditingCatId(null);
      setEditingLocId(null);
      setConfirmDeleteId(null);
      setConfirmDeleteLocId(null);
    }
  }, [isOpen, initialTab]);

  // Edit state for categories (Only MÃ CODE per user request)
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatCode, setEditCatCode] = useState('');
  const [editCatParent, setEditCatParent] = useState<string | null>(null);

  // Add state for categories (Only MÃ CODE per user request)
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatParent, setNewCatParent] = useState('');

  // Delete confirmation state (inline, iframe-safe)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteLocId, setConfirmDeleteLocId] = useState<string | null>(null);

  // Edit state for locations
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editLocGroup, setEditLocGroup] = useState('A');
  const [editLocCol, setEditLocCol] = useState(1);
  const [editLocRow, setEditLocRow] = useState(1);
  const [editLocNote, setEditLocNote] = useState('');

  // Add state for locations
  const [newLocGroup, setNewLocGroup] = useState('A');
  const [newLocCol, setNewLocCol] = useState(1);
  const [newLocRow, setNewLocRow] = useState(1);
  const [newLocNote, setNewLocNote] = useState('');

  if (!isOpen) return null;

  const mainCategories = categories.filter(c => c.type === 'MAIN_CAT');
  const currentTabCategories = categories.filter(c => c.type === activeTab);

  // Handlers for Category Add (Using single MÃ CODE)
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCatCode.trim().toUpperCase();
    if (!val || activeTab === 'LOCATION') return;

    const newCat: CategoryTreeItem = {
      id: `cat-${activeTab.toLowerCase()}-${Date.now().toString().slice(-6)}`,
      parent_id: activeTab === 'SUB_USE' ? (newCatParent || null) : null,
      type: activeTab as CategoryType,
      code: val,
      name: val
    };

    await mroService.saveCategory(newCat);
    setNewCatCode('');
  };

  // Start Edit Category
  const handleStartEditCat = (cat: CategoryTreeItem) => {
    setEditingCatId(cat.id);
    setEditCatCode(cat.code);
    setEditCatParent(cat.parent_id);
    setConfirmDeleteId(null);
  };

  // Save Edit Category
  const handleSaveEditCat = async (cat: CategoryTreeItem) => {
    const val = editCatCode.trim().toUpperCase();
    if (!val) return;
    const updated: CategoryTreeItem = {
      ...cat,
      code: val,
      name: val,
      parent_id: activeTab === 'SUB_USE' ? editCatParent : null
    };
    await mroService.saveCategory(updated);
    setEditingCatId(null);
  };

  // Execute Delete Category (Direct & safe, no window.confirm)
  const handleExecuteDeleteCat = async (id: string) => {
    await mroService.deleteCategory(id);
    setConfirmDeleteId(null);
  };

  // Handlers for Location Add
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const grp = newLocGroup.trim().toUpperCase() || 'A';
    const barcode = `LOC-${grp}-${String(newLocCol).padStart(2, '0')}-${String(newLocRow).padStart(2, '0')}`;
    const newLoc: StorageLocation = {
      id: `loc-${grp.toLowerCase()}-${newLocCol}-${newLocRow}-${Date.now().toString().slice(-4)}`,
      group_code: grp,
      column_no: newLocCol,
      row_no: newLocRow,
      barcode,
      note: newLocNote.trim()
    };

    await mroService.saveLocation(newLoc);
    setNewLocNote('');
  };

  // Start Edit Location
  const handleStartEditLoc = (loc: StorageLocation) => {
    setEditingLocId(loc.id);
    setEditLocGroup(loc.group_code);
    setEditLocCol(loc.column_no);
    setEditLocRow(loc.row_no);
    setEditLocNote(loc.note || '');
    setConfirmDeleteLocId(null);
  };

  // Save Edit Location
  const handleSaveEditLoc = async (loc: StorageLocation) => {
    const grp = editLocGroup.trim().toUpperCase() || 'A';
    const barcode = `LOC-${grp}-${String(editLocCol).padStart(2, '0')}-${String(editLocRow).padStart(2, '0')}`;
    const updated: StorageLocation = {
      ...loc,
      group_code: grp,
      column_no: editLocCol,
      row_no: editLocRow,
      barcode,
      note: editLocNote.trim()
    };
    await mroService.saveLocation(updated);
    setEditingLocId(null);
  };

  // Execute Delete Location (Direct & safe, no window.confirm)
  const handleExecuteDeleteLoc = async (id: string) => {
    await mroService.deleteLocation(id);
    setConfirmDeleteLocId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1D46B6] flex items-center justify-center font-bold text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Quản Lý, Thêm, Sửa & Xóa Danh Mục Kho MRO
              </h3>
              <p className="text-xs text-slate-300">
                Hiển thị và quản lý trực tiếp theo Mã Code cho toàn bộ hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-semibold shrink-0">
          <button
            onClick={() => { setActiveTab('MAIN_CAT'); setEditingCatId(null); setConfirmDeleteId(null); }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'MAIN_CAT'
                ? 'bg-[#1D46B6] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sổ A: Danh mục chính ({categories.filter(c => c.type === 'MAIN_CAT').length})
          </button>

          <button
            onClick={() => { setActiveTab('SUB_USE'); setEditingCatId(null); setConfirmDeleteId(null); }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'SUB_USE'
                ? 'bg-[#1D46B6] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sổ B: Loại sử dụng ({categories.filter(c => c.type === 'SUB_USE').length})
          </button>

          <button
            onClick={() => { setActiveTab('MACHINE_CODE'); setEditingCatId(null); setConfirmDeleteId(null); }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'MACHINE_CODE'
                ? 'bg-[#1D46B6] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sổ C: Mã máy (Kode) ({categories.filter(c => c.type === 'MACHINE_CODE').length})
          </button>

          <button
            onClick={() => { setActiveTab('MACHINE_BRAND'); setEditingCatId(null); setConfirmDeleteId(null); }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'MACHINE_BRAND'
                ? 'bg-[#1D46B6] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hãng máy / Brand ({categories.filter(c => c.type === 'MACHINE_BRAND').length})
          </button>

          <button
            onClick={() => { setActiveTab('LOCATION'); setEditingLocId(null); setConfirmDeleteLocId(null); }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'LOCATION'
                ? 'bg-[#1D46B6] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Vị trí kệ G-K-B ({locations.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Section 1: Add New Form (Single Input: MÃ CODE) */}
          {activeTab === 'LOCATION' ? (
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Mới Vị Trí Kệ Hàng (G-K-B)</span>
              </h4>
              <form onSubmit={handleAddLocation} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Khu Kệ (G) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={newLocGroup}
                    onChange={(e) => setNewLocGroup(e.target.value.toUpperCase())}
                    placeholder="VD: A, B, C, G, K"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Số Cột (K) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newLocCol}
                    onChange={(e) => setNewLocCol(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tầng / Hàng (B) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newLocRow}
                    onChange={(e) => setNewLocRow(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ghi chú vị trí
                  </label>
                  <input
                    type="text"
                    value={newLocNote}
                    onChange={(e) => setNewLocNote(e.target.value)}
                    placeholder="VD: Kệ máy may chuyền 1"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center justify-between pt-1">
                  <span className="text-xs font-mono font-bold text-blue-800">
                    Mã Barcode: LOC-{newLocGroup.toUpperCase() || 'A'}-{String(newLocCol).padStart(2, '0')}-{String(newLocRow).padStart(2, '0')}
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1D46B6] hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors"
                  >
                    + Lưu Vị Trí Kệ Mới
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>
                  + Thêm Mới Vào {
                    activeTab === 'MAIN_CAT'
                      ? 'Sổ A: Danh Mục Chính'
                      : activeTab === 'SUB_USE'
                      ? 'Sổ B: Loại Sử Dụng'
                      : activeTab === 'MACHINE_CODE'
                      ? 'Sổ C: Mã Máy (Kode)'
                      : 'Hãng Máy (Brand)'
                  }
                </span>
              </h4>
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-end gap-3 text-xs">
                {activeTab === 'SUB_USE' && (
                  <div className="w-full sm:w-1/3">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Thuộc Danh mục chính (Sổ A) <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={newCatParent}
                      onChange={(e) => setNewCatParent(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    >
                      <option value="">-- Chọn danh mục cha --</option>
                      {mainCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mã Code danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatCode}
                    onChange={(e) => setNewCatCode(e.target.value.toUpperCase())}
                    placeholder={
                      activeTab === 'MAIN_CAT'
                        ? 'VD: SEWING, LISTRIK, BOILER, MRO, PNEUMATIC...'
                        : activeTab === 'SUB_USE'
                        ? 'VD: 1510, JARUM_SATU, SAMSAGO, 2210...'
                        : activeTab === 'MACHINE_CODE'
                        ? 'VD: KM-250, DDL-8700, LH-3168...'
                        : 'VD: JUKI, BROTHER, SUNSTAR, PEGASUS, JACK...'
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono uppercase font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1D46B6] hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Lưu Thêm Mới</span>
                </button>
              </form>
            </div>
          )}

          {/* Section 2: Existing Table with Edit & Inline Delete */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Danh Sách Hiện Tại & Chỉnh Sửa Trực Tiếp
              </h4>
              <span className="text-[11px] text-slate-500">
                Nhấp nút <strong>Sửa</strong> để đổi mã, hoặc <strong>Xóa</strong> để gỡ bỏ ngay
              </span>
            </div>

            {activeTab === 'LOCATION' ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">MÃ BARCODE</th>
                      <th className="py-2 px-2.5 text-center">KHU (G)</th>
                      <th className="py-2 px-2.5 text-center">CỘT (K)</th>
                      <th className="py-2 px-2.5 text-center">HÀNG (B)</th>
                      <th className="py-2 px-3">GHI CHÚ / MÔ TẢ</th>
                      <th className="py-2 px-3 text-center w-36">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {locations.map(loc => {
                      const isEditing = editingLocId === loc.id;
                      return (
                        <tr key={loc.id} className="hover:bg-slate-50/80">
                          {isEditing ? (
                            <>
                              <td className="py-2 px-3 font-bold text-blue-700">
                                LOC-{editLocGroup.toUpperCase()}-{String(editLocCol).padStart(2, '0')}-{String(editLocRow).padStart(2, '0')}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="text"
                                  maxLength={2}
                                  value={editLocGroup}
                                  onChange={(e) => setEditLocGroup(e.target.value.toUpperCase())}
                                  className="w-12 px-1 py-0.5 border border-blue-500 rounded text-center uppercase font-bold"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={editLocCol}
                                  onChange={(e) => setEditLocCol(parseInt(e.target.value) || 1)}
                                  className="w-12 px-1 py-0.5 border border-blue-500 rounded text-center"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={editLocRow}
                                  onChange={(e) => setEditLocRow(parseInt(e.target.value) || 1)}
                                  className="w-12 px-1 py-0.5 border border-blue-500 rounded text-center"
                                />
                              </td>
                              <td className="py-2 px-2 font-sans">
                                <input
                                  type="text"
                                  value={editLocNote}
                                  onChange={(e) => setEditLocNote(e.target.value)}
                                  className="w-full px-2 py-0.5 border border-blue-500 rounded text-xs"
                                />
                              </td>
                              <td className="py-2 px-2 text-center font-sans">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleSaveEditLoc(loc)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-0.5"
                                  >
                                    <Check className="w-3 h-3" /> Lưu
                                  </button>
                                  <button
                                    onClick={() => setEditingLocId(null)}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px]"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-2 px-3 font-bold text-blue-800">
                                <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                  {loc.barcode}
                                </span>
                              </td>
                              <td className="py-2 px-2.5 text-center font-bold text-slate-800">{loc.group_code}</td>
                              <td className="py-2 px-2.5 text-center">{loc.column_no}</td>
                              <td className="py-2 px-2.5 text-center">{loc.row_no}</td>
                              <td className="py-2 px-3 font-sans text-slate-600">{loc.note || '-'}</td>
                              <td className="py-2 px-2 text-center font-sans">
                                {confirmDeleteLocId === loc.id ? (
                                  <div className="flex items-center justify-center gap-1 bg-red-50 p-1 rounded-md border border-red-200 animate-in fade-in">
                                    <span className="text-[11px] text-red-700 font-bold">Xóa?</span>
                                    <button
                                      onClick={() => handleExecuteDeleteLoc(loc.id)}
                                      className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors shadow-2xs"
                                    >
                                      Có
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteLocId(null)}
                                      className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs transition-colors"
                                    >
                                      Không
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        handleStartEditLoc(loc);
                                        setConfirmDeleteLocId(null);
                                      }}
                                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                      title="Sửa vị trí kệ"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setConfirmDeleteLocId(loc.id);
                                        setEditingLocId(null);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                      title="Xóa vị trí kệ"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">MÃ CODE (DANH MỤC)</th>
                      {activeTab === 'SUB_USE' && (
                        <th className="py-2 px-3">THUỘC SỔ A (DANH MỤC CHA)</th>
                      )}
                      <th className="py-2 px-3 text-center w-36">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {currentTabCategories.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'SUB_USE' ? 3 : 2} className="py-6 text-center text-slate-400 font-sans">
                          Chưa có mục nào trong danh mục này. Hãy thêm mới ở trên.
                        </td>
                      </tr>
                    ) : (
                      currentTabCategories.map(cat => {
                        const isEditing = editingCatId === cat.id;
                        const parentCat = categories.find(c => c.id === cat.parent_id);

                        return (
                          <tr key={cat.id} className="hover:bg-slate-50/80">
                            {isEditing ? (
                              <>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={editCatCode}
                                    onChange={(e) => setEditCatCode(e.target.value.toUpperCase())}
                                    className="w-full px-2.5 py-1 border-2 border-blue-500 rounded text-xs font-mono uppercase font-bold focus:outline-none"
                                    autoFocus
                                  />
                                </td>
                                {activeTab === 'SUB_USE' && (
                                  <td className="py-2 px-3">
                                    <select
                                      value={editCatParent || ''}
                                      onChange={(e) => setEditCatParent(e.target.value || null)}
                                      className="w-full px-2 py-1 border border-blue-500 rounded text-xs bg-white font-mono"
                                    >
                                      <option value="">-- Chọn danh mục cha --</option>
                                      {mainCategories.map(mc => (
                                        <option key={mc.id} value={mc.id}>{mc.code}</option>
                                      ))}
                                    </select>
                                  </td>
                                )}
                                <td className="py-2 px-2 text-center font-sans">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleSaveEditCat(cat)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs"
                                    >
                                      <Check className="w-3 h-3" /> Lưu
                                    </button>
                                    <button
                                      onClick={() => setEditingCatId(null)}
                                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-sm">
                                  {cat.code}
                                </td>
                                {activeTab === 'SUB_USE' && (
                                  <td className="py-2 px-3 text-slate-700">
                                    {parentCat ? (
                                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono text-xs font-semibold">
                                        {parentCat.code}
                                      </span>
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                )}
                                <td className="py-2 px-2 text-center font-sans">
                                  {confirmDeleteId === cat.id ? (
                                    <div className="flex items-center justify-center gap-1 bg-red-50 p-1 rounded-md border border-red-200 animate-in fade-in">
                                      <span className="text-[11px] text-red-700 font-bold">Xóa?</span>
                                      <button
                                        onClick={() => handleExecuteDeleteCat(cat.id)}
                                        className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors shadow-2xs"
                                      >
                                        Có
                                      </button>
                                      <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs transition-colors"
                                      >
                                        Không
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => {
                                          handleStartEditCat(cat);
                                          setConfirmDeleteId(null);
                                        }}
                                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        title="Sửa mã danh mục"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setConfirmDeleteId(cat.id);
                                          setEditingCatId(null);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Xóa danh mục này"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Mọi thay đổi thêm, sửa, xóa danh mục được đồng bộ tức thì trên toàn bộ hệ thống.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
