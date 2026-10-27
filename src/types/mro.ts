/**
 * MRO SMART STOCK CONTROL SYSTEM - TYPES & DATA DEFINITIONS
 * JS Corp Boyolali Factory Specification
 */

export interface SignatureItem {
  id: string;
  role: string;      // e.g., "Dibuat Oleh", "Pengawas", "Petugas SO", "Menyetujui 1", "Menyetujui 2", "Menyetujui 3"
  name: string;      // e.g., "Muh Fuad Rusyadi", "Nguyen Nhat Tien", "Mr. Kim Jong Sung"
  order: number;
}

export interface AppSettings {
  factory_name: string;      // "JS BOYOLALI"
  audit_date: string;        // 실사일자 (Inventory Audit Date, e.g., "2026-10-31")
  effective_date: string;    // 기준일 (Effective / Baseline Date, e.g., "2026-10-01")
  signatures: SignatureItem[];
  allow_negative_stock: boolean;
  currency: string;          // IDR or USD
}

export type CategoryType = 
  | 'MAIN_CAT'       // A: Danh mục chính (SEWING, KOMPUTER SEWING, CUTTING, LISTRIK, PNEUMATIC...)
  | 'SUB_USE'        // B: Loại sử dụng (Jarum Satu, Jarum Dua, 1510, 2210...)
  | 'MACHINE_CODE'   // C: Mã máy / Kode Mesin (KM-250, DDL-8700, AMS-210EN...)
  | 'MACHINE_TYPE'   // D: Loại máy (Single Needle, Double Needle, Bartack, Overlock...)
  | 'MACHINE_BRAND'; // E: Hãng máy (JUKI, BROTHER, SUNSTAR, PEGASUS, SIRUBA, JACK...)

export interface CategoryTreeItem {
  id: string;
  parent_id: string | null;  // For SUB_USE, parent_id is the MAIN_CAT id
  type: CategoryType;
  code: string;
  name: string;
  description?: string;
}

export interface StorageLocation {
  id: string;
  group_code: string;        // Khu/Kệ (A, B, C, D, G, K, B...)
  column_no: number;         // Cột (1, 2, 3...)
  row_no: number;            // Tầng / Hàng (1, 2, 3...)
  barcode: string;           // LOC-A-02-03
  note?: string;
}

export interface SparePart {
  id: string;                // SKU / Part Number (e.g., "SP-SEW-001")
  part_name: string;         // Tên sản phẩm / Nama spare part
  main_cat_id: string;       // Foreign key to CategoryTreeItem (MAIN_CAT)
  sub_cat_id?: string;       // Foreign key to CategoryTreeItem (SUB_USE)
  machine_code?: string;     // Kode Mesin (e.g., KM-250, DDL-8700)
  machine_type?: string;     // Single Needle, Overlock...
  machine_brand?: string;    // JUKI, BROTHER, SUNSTAR...
  location_id: string;       // Foreign key to StorageLocation
  unit: string;              // PCS, ROL, BỘ, MTR, PACK, BOX...
  min_limit: number;         // Ngưỡng cảnh báo tồn tối thiểu (STOCK LIMIT)
  max_limit: number;         // Tồn tối đa
  image_base64?: string;     // Ảnh nén 150x150 base64 hoặc URL
  custom_fields?: Record<string, string>; // Tùy biến thông số: ren, điện áp, quy cách...
  created_at: string;
  updated_at: string;
}

export interface MonthlyInventoryLog {
  id: string;                // `${month_key}_${part_id}`
  month_key: string;         // "2026-10"
  part_id: string;           // FK to SparePart
  beginning_stock: number;   // Tồn đầu kỳ (Akhir Bulan trước)
  received_in_month: number; // Nhập trong tháng (Datang / Masuk)
  daily_issues: Record<string, number>; // {"day_1": 2, "day_5": 1, ...}
  daily_receives?: Record<string, number>; // {"day_2": 5, "day_10": 10, ...}
  total_issue: number;       // Tổng xuất (Keluar) = Sum of daily_issues
  current_stock: number;     // Tồn cuối (Unite) = (beginning_stock + received_in_month) - total_issue
  notes?: string;
  last_updated?: string;
}

export interface WorkshopItem {
  id: string;
  name: string;              // "Xưởng A", "Xưởng B", "Xưởng C", "Xưởng D", "Xưởng E"...
  code: string;              // "A", "B", "C", "D", "E"...
  description?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;              // "Cơ điện", "May chuyền", "Bảo trì máy May", "Khí nén", "Điện xưởng", "Hoàn tất"...
  code: string;
  description?: string;
}

export interface ReceiverItem {
  id: string;
  name: string;              // Họ tên thợ máy / người nhận hàng
  code?: string;             // Mã thợ máy (TM-01, TM-02...)
  workshop: string;          // Xưởng (e.g. "Xưởng A", "Xưởng B", "Xưởng C", "Xưởng D", "Xưởng E")
  department: string;        // Bộ phận (e.g. "Bảo trì máy May", "Cơ điện", "Khí nén")
  note?: string;             // Ghi chú
  active: boolean;           // Đang hoạt động
}

export interface StockTransaction {
  id: string;
  type: 'IN' | 'OUT';        // IN: Nhập kho (Masuk), OUT: Xuất kho (Keluar)
  part_id: string;
  month_key: string;         // "2026-10"
  day: number;               // 1..31
  date: string;              // "2026-10-25"
  quantity: number;
  receiver_id?: string;      // FK to ReceiverItem
  receiver_name?: string;    // Tên người nhận (thợ máy)
  workshop?: string;         // Xưởng
  department?: string;       // Bộ phận
  reason?: string;           // Mục đích / Mã máy sử dụng
  doc_no?: string;           // Số chứng từ / phiếu giao
  document_no?: string;      // Alias for doc_no
  supplier?: string;         // Nhà cung cấp / người giao hàng
  notes?: string;
  created_at: string;
}

export interface MroDatabase {
  settings: AppSettings;
  categories: CategoryTreeItem[];
  locations: StorageLocation[];
  parts: SparePart[];
  inventory_logs: Record<string, MonthlyInventoryLog>; // keyed by `${month_key}_${part_id}`
  receivers: ReceiverItem[];
  workshops: WorkshopItem[];
  departments: DepartmentItem[];
  transactions?: StockTransaction[];
  version: number;
  last_modified: string;
}

export interface SyncStatus {
  connected: boolean;
  workstations_online: number;
  last_synced: string;
  device_id: string;
}

