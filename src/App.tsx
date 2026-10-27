/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SmartFilterBar, FilterState } from './components/SmartFilterBar';
import { ReportModule } from './components/ReportModule';
import { MasterDataModule } from './components/MasterDataModule';
import { SettingsModule } from './components/SettingsModule';
import { PartModal } from './components/PartModal';
import { QuickAddModal } from './components/QuickAddModal';
import { PrintSheetModal } from './components/PrintSheetModal';
import { CategoryManagerModal, ManagerTabType } from './components/CategoryManagerModal';
import { PrintDailyLogModal } from './components/PrintDailyLogModal';
import { StockInOutModal } from './components/StockInOutModal';
import { mroService } from './services/mroStorage';
import { MroDatabase, SparePart } from './types/mro';
import { Language } from './i18n/translations';

export default function App() {
  const [database, setDatabase] = useState<MroDatabase>(mroService.getSnapshot());
  const [activeTab, setActiveTab] = useState<'report' | 'master' | 'settings'>('report');
  const [activeMonth, setActiveMonth] = useState<string>('2026-10');
  const [language, setLanguage] = useState<Language>('vi');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    mainCatId: '',
    subCatId: '',
    machineCode: '',
    machineBrand: '',
    locationGroup: '',
    statusFilter: 'ALL'
  });

  // Modals state
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'MAIN_CAT' | 'SUB_USE' | 'MACHINE_CODE' | 'MACHINE_BRAND' | 'LOCATION'>('MAIN_CAT');
  const [quickAddParentId, setQuickAddParentId] = useState<string | undefined>(undefined);

  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isDailyLogPrintOpen, setIsDailyLogPrintOpen] = useState(false);
  const [dailyPrintMode, setDailyPrintMode] = useState<'OUT' | 'IN'>('OUT');
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categoryManagerTab, setCategoryManagerTab] = useState<ManagerTabType>('MAIN_CAT');
  const [isStockInOutOpen, setIsStockInOutOpen] = useState(false);

  // Subscribe to real-time database state
  useEffect(() => {
    const unsubscribe = mroService.subscribe((updatedDb) => {
      setDatabase({ ...updatedDb });
    });
    return unsubscribe;
  }, []);

  const locMap = useMemo(() => new Map(database.locations.map(l => [l.id, l])), [database.locations]);

  // Find selected main category if filtered in Sổ A
  const selectedMainCategory = useMemo(() => {
    if (!filters.mainCatId) return null;
    return database.categories.find(c => c.id === filters.mainCatId && c.type === 'MAIN_CAT') || null;
  }, [filters.mainCatId, database.categories]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedMainCategory) return undefined;
    return selectedMainCategory.code || selectedMainCategory.name;
  }, [selectedMainCategory]);

  // Count stock limit alerts:
  // When no filter in Sổ A: total count across the entire warehouse
  // When filtered by a main category (SEWING, KOMPUTER SEWING, LISTRIK, PNEUMATIC, MRO, MESIN PRODUCSI): count ONLY that category
  const stockLimitAlertCount = useMemo(() => {
    return database.parts.filter(p => {
      if (filters.mainCatId && p.main_cat_id !== filters.mainCatId) return false;
      const log = database.inventory_logs[`${activeMonth}_${p.id}`];
      const currentStock = log ? log.current_stock : 0;
      return currentStock <= p.min_limit;
    }).length;
  }, [database.parts, database.inventory_logs, activeMonth, filters.mainCatId]);

  // Filtered Parts list according to Smart Filters
  const filteredParts = useMemo(() => {
    return database.parts.filter(part => {
      const log = database.inventory_logs[`${activeMonth}_${part.id}`];
      const currentStock = log ? log.current_stock : 0;
      const isLimit = currentStock <= part.min_limit;

      // Status filter
      if (filters.statusFilter === 'STOCK_LIMIT' && !isLimit) return false;
      if (filters.statusFilter === 'AMAN' && isLimit) return false;

      // Category filters
      if (filters.mainCatId && part.main_cat_id !== filters.mainCatId) return false;
      if (filters.subCatId && part.sub_cat_id !== filters.subCatId) return false;

      // Machine Code
      if (filters.machineCode && part.machine_code !== filters.machineCode) return false;

      // Machine Brand
      if (filters.machineBrand && part.machine_brand !== filters.machineBrand) return false;

      // Location Group
      if (filters.locationGroup) {
        const loc = locMap.get(part.location_id);
        if (!loc || loc.group_code !== filters.locationGroup) return false;
      }

      // Search Query (Search-as-you-type <100ms)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const loc = locMap.get(part.location_id);
        const locText = loc ? `${loc.barcode} ${loc.group_code} ${loc.note || ''}`.toLowerCase() : '';
        const customText = part.custom_fields ? Object.values(part.custom_fields).join(' ').toLowerCase() : '';

        const match =
          part.id.toLowerCase().includes(q) ||
          part.part_name.toLowerCase().includes(q) ||
          (part.machine_code && part.machine_code.toLowerCase().includes(q)) ||
          (part.machine_brand && part.machine_brand.toLowerCase().includes(q)) ||
          locText.includes(q) ||
          customText.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [database.parts, database.inventory_logs, activeMonth, filters, locMap]);

  // Handlers for Part Modal
  const handleAddNewPart = () => {
    setEditingPart(null);
    setIsPartModalOpen(true);
  };

  const handleEditPart = (part: SparePart) => {
    setEditingPart(part);
    setIsPartModalOpen(true);
  };

  const handleDuplicatePart = (part: SparePart) => {
    const duplicate: SparePart = {
      ...part,
      id: `${part.id}-COPY`,
      part_name: `${part.part_name} (Bản sao)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingPart(duplicate);
    setIsPartModalOpen(true);
  };

  const handleSavePart = async (part: SparePart) => {
    await mroService.savePart(part);
  };

  // Quick Add handlers
  const handleOpenQuickAdd = (
    type: 'MAIN_CAT' | 'SUB_USE' | 'MACHINE_CODE' | 'MACHINE_BRAND' | 'LOCATION',
    parentId?: string
  ) => {
    setQuickAddType(type);
    setQuickAddParentId(parentId);
    setIsQuickAddOpen(true);
  };

  const handleQuickAddCompleted = (newItemId: string) => {
    if (quickAddType === 'MAIN_CAT') {
      setFilters(prev => ({ ...prev, mainCatId: newItemId, subCatId: '' }));
    } else if (quickAddType === 'SUB_USE') {
      setFilters(prev => ({ ...prev, subCatId: newItemId }));
    }
  };

  const handleOpenCategoryManager = (tab: ManagerTabType) => {
    setCategoryManagerTab(tab);
    setIsCategoryManagerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      {/* Header Bar */}
      <Header
        currentTab={activeTab}
        onTabChange={setActiveTab}
        activeMonth={activeMonth}
        onMonthChange={setActiveMonth}
        settings={database.settings}
        stockLimitAlertCount={stockLimitAlertCount}
        selectedCategoryName={selectedCategoryName}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Render SmartFilterBar only on Module 1 (Report Tab) */}
        {activeTab === 'report' && (
          <SmartFilterBar
            filters={filters}
            onChange={setFilters}
            categories={database.categories}
            locations={database.locations}
            onOpenQuickAdd={handleOpenQuickAdd}
            onOpenManager={handleOpenCategoryManager}
            stockLimitCount={stockLimitAlertCount}
            totalPartsCount={database.parts.length}
            language={language}
          />
        )}

        {/* Tab 1: Module 1 - Báo Cáo Tổng Hợp (Unified Super Table + 4 KPIs) */}
        {activeTab === 'report' && (
          <ReportModule
            settings={database.settings}
            monthKey={activeMonth}
            parts={filteredParts}
            inventoryLogs={database.inventory_logs}
            categories={database.categories}
            locations={database.locations}
            transactions={database.transactions || []}
            receivers={database.receivers || []}
            selectedMainCatId={filters.mainCatId}
            onOpenPrint={(mode) => {
              setDailyPrintMode(mode || 'OUT');
              setIsDailyLogPrintOpen(true);
            }}
            onEditPart={handleEditPart}
            onDuplicatePart={handleDuplicatePart}
            language={language}
          />
        )}

        {/* Tab 2: Module 2 - Quản Lý Phụ Tùng (2 Balanced Action Cards) */}
        {activeTab === 'master' && (
          <MasterDataModule
            onAddNewPart={handleAddNewPart}
            onOpenStockInOut={() => setIsStockInOutOpen(true)}
            language={language}
            totalParts={database.parts.length}
          />
        )}

        {/* Tab 3: Module 3 - Cài Đặt Hệ Thống */}
        {activeTab === 'settings' && (
          <SettingsModule
            settings={database.settings}
            categories={database.categories}
            locations={database.locations}
            receivers={database.receivers || []}
            workshops={database.workshops || []}
            departments={database.departments || []}
            language={language}
          />
        )}

      </main>

      {/* Part Add/Edit Modal */}
      <PartModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSave={handleSavePart}
        initialPart={editingPart}
        categories={database.categories}
        locations={database.locations}
        onOpenQuickAdd={handleOpenQuickAdd}
        language={language}
      />

      {/* Inline Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        type={quickAddType}
        parentId={quickAddParentId}
        categories={database.categories}
        onAdded={handleQuickAddCompleted}
      />

      {/* Master Category & Shelf Manager Modal (Add / Edit / Delete) */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        initialTab={categoryManagerTab}
        categories={database.categories}
        locations={database.locations}
      />

      {/* Print Preview Modal - Module 1 (Báo Cáo Tổng Hợp) */}
      <PrintSheetModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        settings={database.settings}
        monthKey={activeMonth}
        parts={filteredParts}
        inventoryLogs={database.inventory_logs}
        categories={database.categories}
        locations={database.locations}
        selectedMainCatId={filters.mainCatId}
        language={language}
      />

      {/* Print Preview Modal - Sổ Nhập - Xuất Trong Tháng (Landscape A4) */}
      <PrintDailyLogModal
        isOpen={isDailyLogPrintOpen}
        onClose={() => setIsDailyLogPrintOpen(false)}
        settings={database.settings}
        monthKey={activeMonth}
        parts={filteredParts}
        inventoryLogs={database.inventory_logs}
        categories={database.categories}
        locations={database.locations}
        selectedMainCatId={filters.mainCatId}
        printMode={dailyPrintMode}
        language={language}
      />

      {/* Quick Stock In / Out Modal (Xuất-Nhập Phụ tùng) with Two-Step Confirmation */}
      <StockInOutModal
        isOpen={isStockInOutOpen}
        onClose={() => setIsStockInOutOpen(false)}
        parts={database.parts}
        inventoryLogs={database.inventory_logs}
        categories={database.categories}
        locations={database.locations}
        receivers={database.receivers || []}
        workshops={database.workshops || []}
        departments={database.departments || []}
        monthKey={activeMonth}
        language={language}
        onOpenManageReceivers={() => {
          setIsStockInOutOpen(false);
          setActiveTab('settings');
        }}
      />
    </div>
  );
}
