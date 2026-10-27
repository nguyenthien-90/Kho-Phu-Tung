/**
 * JS Corp Boyolali - Sheet 2 Excel Exporter
 * Generates official Excel (.xlsx) file matching the JS Corp factory standard
 */
import * as XLSX from 'xlsx';
import { AppSettings, SparePart, MonthlyInventoryLog, CategoryTreeItem, StorageLocation } from '../types/mro';

export interface ExportDataOptions {
  settings: AppSettings;
  monthKey: string;
  parts: SparePart[];
  inventoryLogs: Record<string, MonthlyInventoryLog>;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
  selectedMainCatId?: string;
}

export function exportSheet2Excel({
  settings,
  monthKey,
  parts,
  inventoryLogs,
  categories,
  locations,
  selectedMainCatId
}: ExportDataOptions) {
  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const locMap = new Map(locations.map(l => [l.id, `${l.barcode} (${l.group_code}-${l.column_no}-${l.row_no})`]));

  // Selected Category Title (Only present if selectedCat is selected)
  const selectedCat = categories.find(c => c.id === selectedMainCatId && c.type === 'MAIN_CAT');
  let categoryBanner = '';
  if (selectedCat) {
    const codeClean = (selectedCat.code || selectedCat.name || '').trim().toUpperCase();
    const fName = settings.factory_name || 'JS BOYOLALI';
    categoryBanner = `Kategori: STOK SPAREPART ${codeClean} ${fName}`;
  }

  // Build rows array for SheetJS
  const wsData: any[][] = [];

  // Title rows
  wsData.push([`LAPORAN PENGENDALIAN STOK MRO - ${settings.factory_name}`]);
  if (categoryBanner) {
    wsData.push([categoryBanner]);
  }
  wsData.push([`MRO SMART STOCK CONTROL SYSTEM - JS CORP BOYOLALI`]);
  wsData.push([`Kỳ kiểm kê (Bulan): ${monthKey}`, '', `Ngày cơ sở (기준일): ${settings.effective_date}`, '', `Ngày kiểm kê (실사일자): ${settings.audit_date}`]);
  wsData.push([]); // Empty spacer row

  // Signature row block
  const sigRoles = settings.signatures.map(s => s.role);
  const sigNames = settings.signatures.map(s => s.name);
  wsData.push(['BAN KÝ DUYỆT (LEMBAR PENGESAHAN):']);
  wsData.push(['Chức vụ (Role)', ...sigRoles]);
  wsData.push(['Họ tên (Nama)', ...sigNames]);
  wsData.push([]); // Empty spacer row

  // Main table header (matching JS Corp standard)
  const headers = [
    'NO',
    'MÃ PHỤ TÙNG',
    'TÊN PHỤ TÙNG',
    'DANH MỤC (KATEGORI)',
    'LOẠI SỬ DỤNG',
    'MÃ MÁY (KODE MESIN)',
    'LOẠI MÁY (TIPE)',
    'HÃNG (BRAND)',
    'VỊ TRÍ (LOKASI G-K-B)',
    'ĐƠN VỊ (UNIT)',
    'TỒN ĐẦU (AWAL)',
    'NHẬP (MASUK)',
    'XUẤT (KELUAR)',
    'TỒN CUỐI (UNITE)',
    'MIN LIMIT (STOCK LIMIT)',
    'MAX LIMIT',
    'TRẠNG THÁI (STATUS)',
    'GHI CHÚ (KETERANGAN)'
  ];
  wsData.push(headers);

  // Data rows
  parts.forEach((part, index) => {
    const logKey = `${monthKey}_${part.id}`;
    const log = inventoryLogs[logKey] || {
      beginning_stock: 0,
      received_in_month: 0,
      total_issue: 0,
      current_stock: 0,
      notes: ''
    };

    const mainCatName = catMap.get(part.main_cat_id) || part.main_cat_id || '-';
    const subCatName = part.sub_cat_id ? (catMap.get(part.sub_cat_id) || part.sub_cat_id) : '-';
    const locBarcode = locMap.get(part.location_id) || part.location_id || '-';
    const isLimit = log.current_stock <= part.min_limit;
    const statusText = isLimit ? 'STOCK LIMIT (CẢNH BÁO)' : 'AMAN (AN TOÀN)';

    wsData.push([
      index + 1,
      part.id,
      part.part_name,
      mainCatName,
      subCatName,
      part.machine_code || '-',
      part.machine_type || '-',
      part.machine_brand || '-',
      locBarcode,
      part.unit,
      log.beginning_stock,
      log.received_in_month,
      log.total_issue,
      log.current_stock,
      part.min_limit,
      part.max_limit || '-',
      statusText,
      log.notes || ''
    ]);
  });

  // Create workbook and worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column width calculations
  const colWidths = [
    { wch: 6 },  // NO
    { wch: 16 }, // KODE PART
    { wch: 35 }, // NAMA SPARE PART
    { wch: 22 }, // KATEGORI
    { wch: 20 }, // SUB USE
    { wch: 14 }, // KODE MESIN
    { wch: 22 }, // TIPE
    { wch: 12 }, // BRAND
    { wch: 20 }, // LOKASI
    { wch: 8 },  // UNIT
    { wch: 12 }, // AWAL
    { wch: 12 }, // MASUK
    { wch: 12 }, // KELUAR
    { wch: 14 }, // UNITE
    { wch: 14 }, // MIN LIMIT
    { wch: 12 }, // MAX LIMIT
    { wch: 24 }, // STATUS
    { wch: 30 }, // KETERANGAN
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet2_MRO_Stock');

  // Trigger browser download
  const filename = `MRO_Stock_JS_Boyolali_${monthKey}.xlsx`;
  XLSX.writeFile(wb, filename);
}
