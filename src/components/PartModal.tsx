import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  MapPin,
  Layers,
  Sparkles
} from 'lucide-react';
import { SparePart, CategoryTreeItem, StorageLocation } from '../types/mro';
import { compressAndCropImage, getPlaceholderImageSvg } from '../utils/imageCompressor';
import { Language, translations } from '../i18n/translations';

interface PartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (part: SparePart) => Promise<void>;
  initialPart?: SparePart | null;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
  onOpenQuickAdd: (type: 'MAIN_CAT' | 'SUB_USE' | 'MACHINE_CODE' | 'MACHINE_BRAND' | 'LOCATION', parentId?: string) => void;
  language?: Language;
}

export const PartModal: React.FC<PartModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPart,
  categories,
  locations,
  onOpenQuickAdd,
  language = 'vi'
}) => {
  const t = translations[language];

  const [formData, setFormData] = useState<Partial<SparePart>>({
    id: '',
    part_name: '',
    main_cat_id: '',
    sub_cat_id: '',
    machine_code: '',
    machine_type: '',
    machine_brand: '',
    location_id: '',
    unit: 'PCS',
    min_limit: 5,
    max_limit: 25,
    image_base64: '',
    custom_fields: {}
  });

  const [customKey, setCustomKey] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [imageSizeKb, setImageSizeKb] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Categories
  const mainCategories = categories.filter(c => c.type === 'MAIN_CAT');
  const subCategories = categories.filter(c => {
    if (c.type !== 'SUB_USE') return false;
    if (!formData.main_cat_id) return true;
    return c.parent_id === formData.main_cat_id;
  });
  const machineCodes = categories.filter(c => c.type === 'MACHINE_CODE');
  const machineBrands = categories.filter(c => c.type === 'MACHINE_BRAND');

  useEffect(() => {
    if (initialPart) {
      setFormData({ ...initialPart });
      if (initialPart.image_base64 && initialPart.image_base64.startsWith('data:image')) {
        const approxKb = Math.round((initialPart.image_base64.length * 3 / 4) / 1024);
        setImageSizeKb(approxKb);
      } else {
        setImageSizeKb(null);
      }
    } else {
      // Auto-generate next internal ID
      const autoId = `SP-${Date.now().toString().slice(-6)}`;
      setFormData({
        id: autoId,
        part_name: '',
        main_cat_id: mainCategories[0]?.id || '',
        sub_cat_id: '',
        machine_code: machineCodes[0]?.code || '',
        machine_type: '',
        machine_brand: machineBrands[0]?.code || '',
        location_id: locations[0]?.id || '',
        unit: 'PCS',
        min_limit: 5,
        max_limit: 25,
        image_base64: '',
        custom_fields: {}
      });
      setImageSizeKb(null);
    }
  }, [initialPart, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const base64 = await compressAndCropImage(file);
      const sizeKb = Math.round((base64.length * 3 / 4) / 1024);
      setFormData(prev => ({ ...prev, image_base64: base64 }));
      setImageSizeKb(sizeKb);
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddCustomField = () => {
    if (!customKey.trim() || !customValue.trim()) return;
    setFormData(prev => ({
      ...prev,
      custom_fields: {
        ...(prev.custom_fields || {}),
        [customKey.trim()]: customValue.trim()
      }
    }));
    setCustomKey('');
    setCustomValue('');
  };

  const handleRemoveCustomField = (key: string) => {
    setFormData(prev => {
      const updated = { ...(prev.custom_fields || {}) };
      delete updated[key];
      return { ...prev, custom_fields: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.part_name?.trim()) return;

    const partId = formData.id?.trim() || `SP-${Date.now().toString().slice(-6)}`;
    const partToSave: SparePart = {
      id: partId.toUpperCase(),
      part_name: formData.part_name.trim(),
      main_cat_id: formData.main_cat_id || mainCategories[0]?.id || 'cat-sewing',
      sub_cat_id: formData.sub_cat_id || undefined,
      machine_code: formData.machine_code || undefined,
      machine_type: formData.machine_type || undefined,
      machine_brand: formData.machine_brand || undefined,
      location_id: formData.location_id || locations[0]?.id || 'loc-a-1-1',
      unit: formData.unit || 'PCS',
      min_limit: Number(formData.min_limit) || 0,
      max_limit: Number(formData.max_limit) || 0,
      image_base64: formData.image_base64 || getPlaceholderImageSvg(partId),
      custom_fields: formData.custom_fields || {},
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await onSave(partToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {initialPart ? t.pmEditTitle : t.pmAddTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {t.pmSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Top Section: Photo & Primary Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            
            {/* Smart 150x150 Image Box */}
            <div className="w-full sm:w-44 flex flex-col items-center">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                {t.pmPhotoTitle}
              </label>
              <div className="relative w-36 h-36 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center group shadow-xs">
                {formData.image_base64 ? (
                  <img
                    src={formData.image_base64}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                    <span className="text-[10px] leading-tight text-slate-500">{t.pmAutoCompress}</span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[11px] font-medium">{t.pmUploadHover}</span>
                </div>

                {isCompressing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>{t.pmSelectPhoto}</span>
                </button>
                {formData.image_base64 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image_base64: '' }));
                      setImageSizeKb(null);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title={t.pmDeletePhoto}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {imageSizeKb !== null && (
                <span className="text-[10px] text-emerald-600 font-mono mt-1">
                  150x150 · {imageSizeKb} KB (&lt;20KB)
                </span>
              )}
            </div>

            {/* Name and Unit */}
            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.pmPartName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.part_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, part_name: e.target.value }))}
                  placeholder={t.pmPartNamePlaceholder}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.pmUnit} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PCS">PCS ({language === 'id' ? 'Buah / Pcs' : 'Cái / Chiếc'})</option>
                  <option value="BỘ">{language === 'id' ? 'SET (Set)' : 'BỘ (Set)'}</option>
                  <option value="ROL">{language === 'id' ? 'ROL (Gulung)' : 'ROL (Cuộn)'}</option>
                  <option value="MTR">{language === 'id' ? 'MTR (Meter)' : 'MTR (Mét)'}</option>
                  <option value="PACK">{language === 'id' ? 'PACK (Pak)' : 'PACK (Gói)'}</option>
                  <option value="BOX">{language === 'id' ? 'BOX (Kotak)' : 'BOX (Hộp)'}</option>
                </select>
              </div>

              {/* Min & Max Limits */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    {t.pmMinLimit} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.min_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_limit: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 border border-amber-300 bg-white rounded-lg text-xs font-bold text-red-600 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-amber-800">{t.pmMinLimitDesc}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.pmMaxLimit}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.max_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_limit: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">{t.pmMaxLimitDesc}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Classification & Cascade Dropdowns */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.pmClassificationTitle}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Sổ A: Main Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    {t.pmMainCat} <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onOpenQuickAdd('MAIN_CAT')}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> {t.pmQuickAdd}
                  </button>
                </div>
                <select
                  required
                  value={formData.main_cat_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, main_cat_id: e.target.value, sub_cat_id: '' }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.pmSelectMainCat}</option>
                  {mainCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.code}</option>
                  ))}
                </select>
              </div>

              {/* Sổ B: Sub-use */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    {t.pmSubUse}
                  </label>
                  <button
                    type="button"
                    onClick={() => onOpenQuickAdd('SUB_USE', formData.main_cat_id)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> {t.pmQuickAdd}
                  </button>
                </div>
                <select
                  value={formData.sub_cat_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, sub_cat_id: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                >
                  <option value="">{t.pmSelectSubUse}</option>
                  {subCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.code}</option>
                  ))}
                </select>
              </div>

              {/* Sổ C: Machine Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    {t.pmMachineCode}
                  </label>
                  <button
                    type="button"
                    onClick={() => onOpenQuickAdd('MACHINE_CODE')}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> {t.pmQuickAdd}
                  </button>
                </div>
                <select
                  value={formData.machine_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, machine_code: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                >
                  <option value="">{t.pmSelectMachineCode}</option>
                  {machineCodes.map(c => (
                    <option key={c.id} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>

              {/* Hãng máy (Brand) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    {t.pmMachineBrand}
                  </label>
                  <button
                    type="button"
                    onClick={() => onOpenQuickAdd('MACHINE_BRAND')}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> {t.pmQuickAdd}
                  </button>
                </div>
                <select
                  value={formData.machine_brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, machine_brand: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                >
                  <option value="">{t.pmSelectMachineBrand}</option>
                  {machineBrands.map(b => (
                    <option key={b.id} value={b.code || b.name}>{b.code || b.name}</option>
                  ))}
                </select>
              </div>

              {/* Vị trí kệ (G-K-B) */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{t.pmLocation} <span className="text-red-500">*</span></span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onOpenQuickAdd('LOCATION')}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> {t.pmQuickAdd}
                  </button>
                </div>
                <select
                  required
                  value={formData.location_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                >
                  <option value="">{t.pmSelectLocation}</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.barcode} · Khu {loc.group_code} - Cột {loc.column_no} - Hàng {loc.row_no} {loc.note ? `(${loc.note})` : ''}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Dynamic Custom Fields */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.pmCustomFieldsTitle}</span>
            </h4>
            <p className="text-[11px] text-slate-500 mb-2.5">
              {t.pmCustomFieldsDesc}
            </p>

            {/* List existing custom fields */}
            {formData.custom_fields && Object.keys(formData.custom_fields).length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(formData.custom_fields).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div>
                      <span className="font-semibold text-slate-700">{key}: </span>
                      <span className="text-slate-900">{val}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(key)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Custom Field row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t.pmParamNamePlaceholder}
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder={t.pmParamValuePlaceholder}
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium shrink-0"
              >
                {t.pmBtnAddParam}
              </button>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {t.pmBtnCancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialPart ? t.pmBtnUpdate : t.pmBtnSave}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
