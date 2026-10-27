import React, { useState } from 'react';
import {
  Users,
  Building,
  Layers,
  MapPin,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertCircle,
  UserCheck,
  Wrench,
  Edit2,
  Search,
  X,
  Factory,
  CheckCircle2
} from 'lucide-react';
import {
  AppSettings,
  SignatureItem,
  CategoryTreeItem,
  StorageLocation,
  MroDatabase,
  ReceiverItem,
  WorkshopItem,
  DepartmentItem
} from '../types/mro';
import { mroService } from '../services/mroStorage';
import { Language, translations } from '../i18n/translations';

interface SettingsModuleProps {
  settings: AppSettings;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
  receivers?: ReceiverItem[];
  workshops?: WorkshopItem[];
  departments?: DepartmentItem[];
  initialSubTab?: 'receivers' | 'signatures' | 'factory' | 'categories' | 'locations' | 'backup';
  language?: Language;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  settings,
  categories,
  locations,
  receivers = [],
  workshops = [],
  departments = [],
  initialSubTab = 'receivers',
  language = 'vi'
}) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'receivers' | 'signatures' | 'factory' | 'categories' | 'locations' | 'backup'>(initialSubTab);
  
  // Safe receivers, workshops, departments
  const safeReceivers = receivers;
  const safeWorkshops = workshops;
  const safeDepartments = departments;

  // Receivers Filters & State
  const [receiverSearch, setReceiverSearch] = useState('');
  const [filterWorkshop, setFilterWorkshop] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Receiver Form Modal
  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);
  const [editingReceiver, setEditingReceiver] = useState<ReceiverItem | null>(null);
  const [recName, setRecName] = useState('');
  const [recCode, setRecCode] = useState('');
  const [recWorkshop, setRecWorkshop] = useState('');
  const [recDept, setRecDept] = useState('');
  const [recNote, setRecNote] = useState('');
  const [recActive, setRecActive] = useState(true);

  // Workshop Manager Modal
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsCode, setNewWsCode] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [editingWs, setEditingWs] = useState<WorkshopItem | null>(null);

  // Department Manager Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);

  // Local state for editable settings
  const [factoryName, setFactoryName] = useState(settings.factory_name);
  const [auditDate, setAuditDate] = useState(settings.audit_date);
  const [effectiveDate, setEffectiveDate] = useState(settings.effective_date);
  const [signatures, setSignatures] = useState<SignatureItem[]>(settings.signatures);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Category form state
  const [newCatType, setNewCatType] = useState<CategoryTreeItem['type']>('MAIN_CAT');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('');

  // New Location form state
  const [newLocGroup, setNewLocGroup] = useState('A');
  const [newLocCol, setNewLocCol] = useState(1);
  const [newLocRow, setNewLocRow] = useState(1);
  const [newLocNote, setNewLocNote] = useState('');

  // Save Settings
  const handleSaveSettings = async () => {
    await mroService.saveSettings({
      factory_name: factoryName,
      audit_date: auditDate,
      effective_date: effectiveDate,
      signatures: signatures
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Signatures handlers
  const handleAddSignature = () => {
    const nextOrder = signatures.length + 1;
    setSignatures([
      ...signatures,
      {
        id: `sig-${Date.now()}`,
        role: `Ký duyệt ${nextOrder}`,
        name: 'Họ và tên người ký',
        order: nextOrder
      }
    ]);
  };

  const handleRemoveSignature = (id: string) => {
    setSignatures(signatures.filter(s => s.id !== id));
  };

  const handleUpdateSignature = (id: string, field: 'role' | 'name', value: string) => {
    setSignatures(signatures.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleMoveSignature = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= signatures.length) return;
    const copy = [...signatures];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    // Re-index orders
    copy.forEach((item, idx) => { item.order = idx + 1; });
    setSignatures(copy);
  };

  // Category handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const normCode = (newCatCode.trim() || newCatName.trim())
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_-]/g, '');

    const newCat: CategoryTreeItem = {
      id: `cat-${newCatType.toLowerCase()}-${Date.now().toString().slice(-6)}`,
      parent_id: newCatType === 'SUB_USE' ? (newCatParent || null) : null,
      type: newCatType,
      code: normCode,
      name: newCatName.trim()
    };

    await mroService.saveCategory(newCat);
    setNewCatCode('');
    setNewCatName('');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      await mroService.deleteCategory(id);
    }
  };

  // Location handlers
  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = `LOC-${newLocGroup.toUpperCase()}-${String(newLocCol).padStart(2, '0')}-${String(newLocRow).padStart(2, '0')}`;
    const newLoc: StorageLocation = {
      id: `loc-${newLocGroup.toLowerCase()}-${newLocCol}-${newLocRow}-${Date.now().toString().slice(-4)}`,
      group_code: newLocGroup.toUpperCase(),
      column_no: newLocCol,
      row_no: newLocRow,
      barcode,
      note: newLocNote
    };

    await mroService.saveLocation(newLoc);
    setNewLocNote('');
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa vị trí kệ này?')) {
      await mroService.deleteLocation(id);
    }
  };

  // Backup & Restore
  const handleDownloadBackup = () => {
    const fullDb = mroService.getSnapshot();
    const jsonStr = JSON.stringify(fullDb, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MRO_Database_Backup_JS_Boyolali_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings && parsed.parts) {
          if (confirm('Khôi phục sẽ thay thế toàn bộ dữ liệu hiện tại bằng tệp sao lưu. Tiếp tục?')) {
            await mroService.importFullDatabase(parsed);
            alert('Khôi phục dữ liệu thành công!');
          }
        } else {
          alert('Tệp sao lưu không đúng định dạng MRO Database.');
        }
      } catch (err) {
        alert('Lỗi đọc tệp JSON: ' + String(err));
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = async () => {
    if (confirm('Bạn có chắc muốn khôi phục về dữ liệu mẫu ban đầu của nhà máy JS Boyolali không?')) {
      await mroService.resetToFactoryDefault();
      alert('Đã khôi phục dữ liệu gốc nhà máy JS Boyolali.');
    }
  };

  // Receiver Handlers
  const handleOpenAddReceiver = () => {
    setEditingReceiver(null);
    setRecName('');
    setRecCode(`TM-${String(safeReceivers.length + 1).padStart(2, '0')}`);
    setRecWorkshop(safeWorkshops[0]?.name || 'Xưởng A');
    setRecDept(safeDepartments[0]?.name || 'Bảo trì máy May');
    setRecNote('');
    setRecActive(true);
    setIsReceiverModalOpen(true);
  };

  const handleOpenEditReceiver = (rec: ReceiverItem) => {
    setEditingReceiver(rec);
    setRecName(rec.name);
    setRecCode(rec.code || '');
    setRecWorkshop(rec.workshop);
    setRecDept(rec.department);
    setRecNote(rec.note || '');
    setRecActive(rec.active);
    setIsReceiverModalOpen(true);
  };

  const handleSaveReceiverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recName.trim()) return;

    const item: ReceiverItem = {
      id: editingReceiver ? editingReceiver.id : `rec-${Date.now().toString().slice(-6)}`,
      name: recName.trim(),
      code: recCode.trim() || `TM-${String(safeReceivers.length + 1).padStart(2, '0')}`,
      workshop: recWorkshop || (safeWorkshops[0]?.name || 'Xưởng A'),
      department: recDept || (safeDepartments[0]?.name || 'Bảo trì máy May'),
      note: recNote.trim(),
      active: recActive
    };

    await mroService.saveReceiver(item);
    setIsReceiverModalOpen(false);
  };

  const handleDeleteReceiver = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa người nhận hàng "${name}"?`)) {
      await mroService.deleteReceiver(id);
    }
  };

  // Workshop Handlers
  const handleOpenAddWorkshop = () => {
    setEditingWs(null);
    setNewWsName('');
    setNewWsCode('');
    setNewWsDesc('');
    setIsWorkshopModalOpen(true);
  };

  const handleOpenEditWorkshop = (ws: WorkshopItem) => {
    setEditingWs(ws);
    setNewWsName(ws.name);
    setNewWsCode(ws.code);
    setNewWsDesc(ws.description || '');
    setIsWorkshopModalOpen(true);
  };

  const handleSaveWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const ws: WorkshopItem = {
      id: editingWs ? editingWs.id : `ws-${Date.now().toString().slice(-6)}`,
      name: newWsName.trim(),
      code: newWsCode.trim() || newWsName.trim().slice(-1).toUpperCase(),
      description: newWsDesc.trim()
    };
    await mroService.saveWorkshop(ws);
    setEditingWs(null);
    setNewWsName('');
    setNewWsCode('');
    setNewWsDesc('');
  };

  const handleDeleteWorkshop = async (ws: WorkshopItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${ws.name}"?`)) {
      await mroService.deleteWorkshop(ws.id);
    }
  };

  // Department Handlers
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptDesc('');
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setNewDeptName(dept.name);
    setNewDeptCode(dept.code);
    setNewDeptDesc(dept.description || '');
    setIsDeptModalOpen(true);
  };

  const handleSaveDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const dept: DepartmentItem = {
      id: editingDept ? editingDept.id : `dept-${Date.now().toString().slice(-6)}`,
      name: newDeptName.trim(),
      code: newDeptCode.trim() || newDeptName.trim().toUpperCase().replace(/\s+/g, '_'),
      description: newDeptDesc.trim()
    };
    await mroService.saveDepartment(dept);
    setEditingDept(null);
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptDesc('');
  };

  const handleDeleteDepartment = async (dept: DepartmentItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bộ phận "${dept.name}"?`)) {
      await mroService.deleteDepartment(dept.id);
    }
  };

  const filteredReceivers = safeReceivers.filter(r => {
    if (filterWorkshop && r.workshop !== filterWorkshop) return false;
    if (filterDept && r.department !== filterDept) return false;
    if (receiverSearch.trim()) {
      const q = receiverSearch.toLowerCase().trim();
      const match = r.name.toLowerCase().includes(q) ||
        (r.code && r.code.toLowerCase().includes(q)) ||
        r.workshop.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        (r.note && r.note.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const mainCategories = categories.filter(c => c.type === 'MAIN_CAT');

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {t.settingsTitle.toUpperCase()}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'id'
              ? 'Konfigurasi teknisi penerima, dewan pengesahan laporan, pohon kategori teknis, tata letak rak (G-K-B), dan pencadangan data.'
              : 'Cấu hình người nhận hàng, ban ký duyệt báo cáo, cây danh mục phân cấp, sơ đồ vị trí kệ kho (G-K-B), và sao lưu dữ liệu.'}
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{language === 'id' ? 'Pengaturan berhasil disimpan!' : 'Đã lưu cài đặt thành công!'}</span>
          </div>
        )}
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 pt-3 rounded-t-xl overflow-x-auto text-xs font-semibold">
        {/* Người nhận hàng placed to the LEFT of Ban ký duyệt */}
        <button
          onClick={() => setActiveSubTab('receivers')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'receivers'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{t.tabReceivers} ({safeReceivers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('signatures')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'signatures'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.tabSignatures} ({signatures.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('factory')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'factory'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{t.tabFactory}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'categories'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.tabCategories} ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('locations')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'locations'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t.tabLocations} ({locations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'backup'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>{t.tabBackup}</span>
        </button>
      </div>

      {/* Tab 0: Người Nhận Hàng (Danh Bạ Thợ Máy & Quản Lý Xưởng, Bộ Phận) */}
      {activeSubTab === 'receivers' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Danh Sách Người Nhận Hàng (Danh Bạ Thợ Máy & Nhân Viên Xưởng)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý thợ máy nhận phụ tùng xuất kho, thông tin xưởng (A, B, C, D, E) và bộ phận. Đây là cơ sở phục vụ xuất kho ở Module 3.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOpenAddWorkshop}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Quản lý danh mục các Xưởng (A, B, C, D, E...)"
              >
                <Factory className="w-3.5 h-3.5 text-blue-600" />
                <span>Quản Lý Xưởng ({safeWorkshops.length})</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddDept}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Quản lý danh mục các Bộ Phận (Cơ điện, May chuyền, Bảo trì...)"
              >
                <Wrench className="w-3.5 h-3.5 text-purple-600" />
                <span>Quản Lý Bộ Phận ({safeDepartments.length})</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddReceiver}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Người Nhận Mới</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm thợ máy theo tên, mã số TM-01, xưởng, bộ phận..."
                value={receiverSearch}
                onChange={(e) => setReceiverSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
              {receiverSearch && (
                <button
                  onClick={() => setReceiverSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={filterWorkshop}
              onChange={(e) => setFilterWorkshop(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="">-- Tất cả xưởng --</option>
              {safeWorkshops.map(w => (
                <option key={w.id} value={w.name}>{w.name}</option>
              ))}
            </select>

            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="">-- Tất cả bộ phận --</option>
              {safeDepartments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            {(receiverSearch || filterWorkshop || filterDept) && (
              <button
                type="button"
                onClick={() => {
                  setReceiverSearch('');
                  setFilterWorkshop('');
                  setFilterDept('');
                }}
                className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                title="Bỏ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Receivers Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200">NO</th>
                  <th className="py-2.5 px-3 w-24 border-r border-slate-200">MÃ THỢ</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 min-w-[160px]">HỌ VÀ TÊN NGƯỜI NHẬN</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">XƯỞNG</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">BỘ PHẬN</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">GHI CHÚ</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200 w-28">TRẠNG THÁI</th>
                  <th className="py-2.5 px-3 text-center w-24">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReceivers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Chưa có người nhận hàng nào phù hợp với tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredReceivers.map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900 border-r border-slate-200">
                        {rec.code || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                        {rec.name}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-200">
                          {rec.workshop}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-semibold border border-purple-200">
                          {rec.department}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200 truncate max-w-[200px]">
                        {rec.note || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-200">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {rec.active ? 'Hoạt động' : 'Tạm nghỉ'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditReceiver(rec)}
                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReceiver(rec.id, rec.name)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Xóa người nhận"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 1: Ban Ký Duyệt (Signatures Management) */}
      {activeSubTab === 'signatures' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Danh Sách Người Ký Duyệt Báo Cáo (Lembar Pengesahan)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các ô chữ ký này sẽ tự động xuất hiện trên Header bảng báo cáo tổng hợp và phiếu in chuẩn JS Corp.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddSignature}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Người Ký</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-2xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {signatures.map((sig, idx) => (
              <div
                key={sig.id}
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <span className="w-6 text-center font-mono font-bold text-slate-400 text-xs">
                  #{idx + 1}
                </span>

                {/* Role input */}
                <div className="w-1/3">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Chức danh / Vị trí ký
                  </label>
                  <input
                    type="text"
                    value={sig.role}
                    onChange={(e) => handleUpdateSignature(sig.id, 'role', e.target.value)}
                    placeholder="VD: Dibuat Oleh, Pengawas, Menyetujui..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-medium"
                  />
                </div>

                {/* Name input */}
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Họ và tên người ký duyệt
                  </label>
                  <input
                    type="text"
                    value={sig.name}
                    onChange={(e) => handleUpdateSignature(sig.id, 'name', e.target.value)}
                    placeholder="VD: Muh Fuad Rusyadi, Mr. Kim Jong Sung..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-800"
                  />
                </div>

                {/* Reorder and Delete controls */}
                <div className="flex items-center gap-1 pt-4">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSignature(idx, 'up')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                    title="Di chuyển lên trước"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === signatures.length - 1}
                    onClick={() => handleMoveSignature(idx, 'down')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                    title="Di chuyển xuống sau"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSignature(sig.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Xóa ô ký duyệt này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Thông tin nhà máy & Kỳ kho */}
      {activeSubTab === 'factory' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-slate-900">Thông Tin Nhà Máy & Ngày Cơ Sở Kiểm Kê</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên nhà máy (Factory Name)
              </label>
              <input
                type="text"
                value={factoryName}
                onChange={(e) => setFactoryName(e.target.value)}
                placeholder="VD: JS BOYOLALI"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ngày cơ sở (기준일 - Effective Date)
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ngày kiểm kê (실사일자 - Audit Date)
                </label>
                <input
                  type="date"
                  value={auditDate}
                  onChange={(e) => setAuditDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-2xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Thông Tin Nhà Máy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cây danh mục (Category Tree) */}
      {activeSubTab === 'categories' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 space-y-5">
          {/* Add Category Form */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              + Thêm Mới Vào Cây Danh Mục
            </h4>
            <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Loại danh mục</label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="MAIN_CAT">A: Danh mục chính (SEWING, LISTRIK...)</option>
                  <option value="SUB_USE">B: Loại sử dụng (Jarum Satu, 1510...)</option>
                  <option value="MACHINE_CODE">C: Mã máy (KM-250, DDL-8700...)</option>
                  <option value="MACHINE_TYPE">D: Loại máy (Single Needle, Bartack...)</option>
                  <option value="MACHINE_BRAND">E: Hãng máy (JUKI, BROTHER...)</option>
                </select>
              </div>

              {newCatType === 'SUB_USE' && (
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Thuộc danh mục cha</label>
                  <select
                    value={newCatParent}
                    onChange={(e) => setNewCatParent(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">-- Chọn danh mục cha --</option>
                    {mainCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-600 mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  required
                  placeholder="VD: PNEUMATIC hoặc Jarum Ba"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Mã Code (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Tự sinh nếu trống"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                  + Thêm danh mục
                </button>
              </div>
            </form>
          </div>

          {/* Categories Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">PHÂN LOẠI</th>
                  <th className="py-2 px-3">MÃ CODE</th>
                  <th className="py-2 px-3">TÊN HIỂN THỊ</th>
                  <th className="py-2 px-3">DANH MỤC CHA (NẾU CÓ)</th>
                  <th className="py-2 px-3 text-center w-20">XÓA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((c) => {
                  const parent = categories.find(p => p.id === c.parent_id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
                          {c.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{c.code}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-2 px-3 text-slate-500">{parent?.name || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Vị trí kệ kho G-K-B (Storage Locations) */}
      {activeSubTab === 'locations' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 space-y-5">
          {/* Add Location Form */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              + Thiết Lập Vị Trí Kệ Mới (G-K-B)
            </h4>
            <form onSubmit={handleCreateLocation} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Khu / Kệ (G)</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={newLocGroup}
                  onChange={(e) => setNewLocGroup(e.target.value.toUpperCase())}
                  placeholder="VD: A, B, C, G"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Số Cột (K)</label>
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
                <label className="block font-medium text-slate-600 mb-1">Tầng / Hàng (B)</label>
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
                <label className="block font-medium text-slate-600 mb-1">Mô tả vị trí</label>
                <input
                  type="text"
                  value={newLocNote}
                  onChange={(e) => setNewLocNote(e.target.value)}
                  placeholder="VD: Kệ máy may 1 kim chuyền 2"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="sm:col-span-4 flex items-center justify-between pt-1">
                <span className="text-xs text-blue-700 font-mono font-bold">
                  Barcode sinh tự động: LOC-{newLocGroup.toUpperCase() || 'A'}-{String(newLocCol).padStart(2, '0')}-{String(newLocRow).padStart(2, '0')}
                </span>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                  + Thêm vị trí kệ
                </button>
              </div>
            </form>
          </div>

          {/* Locations Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">MÃ BARCODE</th>
                  <th className="py-2 px-3 text-center">KHU (G)</th>
                  <th className="py-2 px-3 text-center">CỘT (K)</th>
                  <th className="py-2 px-3 text-center">HÀNG / TẦNG (B)</th>
                  <th className="py-2 px-3">MÔ TẢ VỊ TRÍ</th>
                  <th className="py-2 px-3 text-center w-20">XÓA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-blue-800">
                      <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {loc.barcode}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-800">{loc.group_code}</td>
                    <td className="py-2 px-3 text-center">{loc.column_no}</td>
                    <td className="py-2 px-3 text-center">{loc.row_no}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{loc.note || '-'}</td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded font-sans"
                        title="Xóa kệ này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Sao Lưu & Đồng Bộ */}
      {activeSubTab === 'backup' && (
        <div className="bg-white border border-slate-200 rounded-b-xl p-5 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sao Lưu & Khôi Phục Dữ Liệu Toàn Hệ Thống</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Xuất tệp JSON để lưu trữ dự phòng hoặc chuyển dữ liệu sang máy tính khác.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Download Backup */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/70 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Xuất Tệp Sao Lưu (Export JSON)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Tải về toàn bộ cơ sở dữ liệu: Phụ tùng, sổ xuất 31 ngày, sơ đồ kệ và cài đặt người ký.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Tệp Sao Lưu .JSON</span>
              </button>
            </div>

            {/* Upload Restore */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/70 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Khôi Phục Dữ Liệu (Import JSON)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Chọn tệp JSON sao lưu trước đó để nạp lại dữ liệu cho hệ thống.
                </p>
              </div>
              <label className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn Tệp JSON Để Khôi Phục</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleUploadBackup}
                  className="hidden"
                />
              </label>
            </div>

          </div>

          {/* Reset to Factory Defaults */}
          <div className="pt-4 border-t border-slate-200">
            <div className="p-4 border border-red-200 rounded-xl bg-red-50/40 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-red-900 mb-0.5 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-red-600" />
                  <span>Khôi Phục Dữ Liệu Gốc Nhà Máy JS Boyolali</span>
                </h4>
                <p className="text-[11px] text-red-700">
                  Cài đặt lại danh mục phụ tùng, ban ký duyệt chuẩn 6 người ký và sơ đồ kệ mặc định.
                </p>
              </div>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0"
              >
                Reset Về Mặc Định
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Thêm / Sửa Người Nhận Hàng (Thợ máy) */}
      {isReceiverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  {editingReceiver ? 'Chỉnh Sửa Người Nhận Hàng' : 'Thêm Người Nhận Hàng Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiverModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReceiverSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Họ và tên người nhận <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Tuấn"
                  value={recName}
                  onChange={(e) => setRecName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mã số thợ máy / nhân viên:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: TM-01"
                  value={recCode}
                  onChange={(e) => setRecCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Xưởng (ABCDE):</label>
                    <button
                      type="button"
                      onClick={() => setIsWorkshopModalOpen(true)}
                      className="text-[10.5px] text-blue-600 hover:underline"
                    >
                      + Sửa danh sách xưởng
                    </button>
                  </div>
                  <select
                    value={recWorkshop}
                    onChange={(e) => setRecWorkshop(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium bg-white"
                  >
                    {safeWorkshops.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Bộ phận:</label>
                    <button
                      type="button"
                      onClick={() => setIsDeptModalOpen(true)}
                      className="text-[10.5px] text-purple-600 hover:underline"
                    >
                      + Sửa danh sách bộ phận
                    </button>
                  </div>
                  <select
                    value={recDept}
                    onChange={(e) => setRecDept(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium bg-white"
                  >
                    {safeDepartments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ghi chú / Vị trí phụ trách:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thợ trưởng chuyền may 1-5..."
                  value={recNote}
                  onChange={(e) => setRecNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recActiveCheck"
                  checked={recActive}
                  onChange={(e) => setRecActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="recActiveCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Đang làm việc (Kích hoạt nhận hàng xuất kho)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsReceiverModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  {editingReceiver ? 'Lưu Thay Đổi' : 'Thêm Người Nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quản lý Danh Mục Xưởng (Workshops A, B, C, D, E...) */}
      {isWorkshopModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Quản Lý Danh Mục Xưởng (Workshops A, B, C, D, E...)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Thêm, bớt, chỉnh sửa hoặc xóa danh sách các xưởng sản xuất
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsWorkshopModalOpen(false);
                  setEditingWs(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Add / Edit Workshop */}
            <form onSubmit={handleSaveWorkshopSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 text-xs">
                {editingWs ? `Chỉnh sửa xưởng: ${editingWs.name}` : '+ Thêm xưởng mới:'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Tên xưởng (Ví dụ: Xưởng F, Xưởng In...)"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Mã (F, G...)"
                    value={newWsCode}
                    onChange={(e) => setNewWsCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono uppercase"
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Mô tả chức năng xưởng..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                {editingWs && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWs(null);
                      setNewWsName('');
                      setNewWsCode('');
                      setNewWsDesc('');
                    }}
                    className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Hủy sửa
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs"
                >
                  {editingWs ? 'Cập Nhật Xưởng' : '+ Lưu Xưởng Mới'}
                </button>
              </div>
            </form>

            {/* Existing Workshops Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 sticky top-0">
                  <tr className="border-b font-semibold text-slate-700">
                    <th className="py-2 px-3 w-16">MÃ</th>
                    <th className="py-2 px-3">TÊN XƯỞNG</th>
                    <th className="py-2 px-3">MÔ TẢ</th>
                    <th className="py-2 px-3 text-center w-20">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {safeWorkshops.map((ws) => (
                    <tr key={ws.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-blue-800">{ws.code}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{ws.name}</td>
                      <td className="py-2 px-3 text-slate-500 truncate max-w-[200px]">{ws.description || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditWorkshop(ws)}
                            className="p-1 text-slate-500 hover:text-blue-600"
                            title="Sửa xưởng"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWorkshop(ws)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Xóa xưởng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsWorkshopModalOpen(false);
                  setEditingWs(null);
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Quản lý Danh Mục Bộ Phận (Departments) */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Quản Lý Danh Mục Bộ Phận (Departments)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Thêm, bớt, chỉnh sửa hoặc xóa danh sách các bộ phận kỹ thuật
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDeptModalOpen(false);
                  setEditingDept(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Add / Edit Department */}
            <form onSubmit={handleSaveDeptSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 text-xs">
                {editingDept ? `Chỉnh sửa bộ phận: ${editingDept.name}` : '+ Thêm bộ phận mới:'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Tên bộ phận (Ví dụ: Cơ điện, Bảo trì, Khí nén...)"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Mã (CO_DIEN...)"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono uppercase"
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Mô tả công việc của bộ phận..."
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                {editingDept && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDept(null);
                      setNewDeptName('');
                      setNewDeptCode('');
                      setNewDeptDesc('');
                    }}
                    className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Hủy sửa
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-2xs"
                >
                  {editingDept ? 'Cập Nhật Bộ Phận' : '+ Lưu Bộ Phận Mới'}
                </button>
              </div>
            </form>

            {/* Existing Departments Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 sticky top-0">
                  <tr className="border-b font-semibold text-slate-700">
                    <th className="py-2 px-3 w-28">MÃ CODE</th>
                    <th className="py-2 px-3">TÊN BỘ PHẬN</th>
                    <th className="py-2 px-3">MÔ TẢ</th>
                    <th className="py-2 px-3 text-center w-20">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {safeDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-purple-900">{dept.code}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{dept.name}</td>
                      <td className="py-2 px-3 text-slate-500 truncate max-w-[200px]">{dept.description || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditDept(dept)}
                            className="p-1 text-slate-500 hover:text-purple-600"
                            title="Sửa bộ phận"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDepartment(dept)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Xóa bộ phận"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeptModalOpen(false);
                  setEditingDept(null);
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
