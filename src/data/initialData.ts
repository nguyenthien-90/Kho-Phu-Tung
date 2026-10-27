/**
 * INITIAL SEED DATA FOR JS CORP BOYOLALI MRO SYSTEM
 * ONLY 6 MAIN CATEGORIES (SEWING, KOMPUTER SEWING, LISTRIK, PNEUMATIC, MRO, MESIN PRODUCSI)
 * WITH EXACTLY 7 SPARE PARTS EACH (42 PARTS TOTAL)
 */
import {
  MroDatabase,
  AppSettings,
  CategoryTreeItem,
  StorageLocation,
  SparePart,
  MonthlyInventoryLog,
  WorkshopItem,
  DepartmentItem,
  ReceiverItem,
  StockTransaction
} from '../types/mro';

export const INITIAL_SETTINGS: AppSettings = {
  factory_name: "JS BOYOLALI",
  audit_date: "2026-10-31",
  effective_date: "2026-10-01",
  allow_negative_stock: false,
  currency: "IDR",
  signatures: [
    { id: "sig-1", role: "Dibuat Oleh", name: "Muh Fuad Rusyadi", order: 1 },
    { id: "sig-2", role: "Pengawas", name: "Nguyen Nhat Tien", order: 2 },
    { id: "sig-3", role: "Petugas SO", name: "Atika Oktaviana", order: 3 },
    { id: "sig-4", role: "Menyetujui 1", name: "Mr. Kim Jong Sung", order: 4 },
    { id: "sig-5", role: "Menyetujui 2", name: "Mr. Cha Young Jun", order: 5 },
    { id: "sig-6", role: "Menyetujui 3", name: "Mr. Chung Hae Young", order: 6 },
  ]
};

export const INITIAL_CATEGORIES: CategoryTreeItem[] = [
  // MAIN_CAT (A) - Đúng 6 ngành hàng duy nhất
  { id: "cat-sewing", parent_id: null, type: "MAIN_CAT", code: "SEWING", name: "SEWING" },
  { id: "cat-komputer", parent_id: null, type: "MAIN_CAT", code: "KOMPUTER SEWING", name: "KOMPUTER SEWING" },
  { id: "cat-listrik", parent_id: null, type: "MAIN_CAT", code: "LISTRIK", name: "LISTRIK" },
  { id: "cat-pneumatic", parent_id: null, type: "MAIN_CAT", code: "PNEUMATIC", name: "PNEUMATIC" },
  { id: "cat-mro", parent_id: null, type: "MAIN_CAT", code: "MRO", name: "MRO" },
  { id: "cat-mesin-produksi", parent_id: null, type: "MAIN_CAT", code: "MESIN PRODUCSI", name: "MESIN PRODUCSI" },

  // SUB_USE (B) for SEWING
  { id: "sub-jarum-1", parent_id: "cat-sewing", type: "SUB_USE", code: "JARUM_SATU", name: "JARUM_SATU" },
  { id: "sub-jarum-2", parent_id: "cat-sewing", type: "SUB_USE", code: "JARUM_DUA", name: "JARUM_DUA" },
  { id: "sub-samsago", parent_id: "cat-sewing", type: "SUB_USE", code: "SAMSAGO", name: "SAMSAGO" },
  { id: "sub-posta", parent_id: "cat-sewing", type: "SUB_USE", code: "POSTA", name: "POSTA" },
  { id: "sub-melo", parent_id: "cat-sewing", type: "SUB_USE", code: "MELO", name: "MELO" },
  { id: "sub-kansai", parent_id: "cat-sewing", type: "SUB_USE", code: "KANSAI", name: "KANSAI" },
  { id: "sub-obras", parent_id: "cat-sewing", type: "SUB_USE", code: "OBRAS", name: "OBRAS" },

  // SUB_USE (B) for KOMPUTER SEWING
  { id: "sub-1510", parent_id: "cat-komputer", type: "SUB_USE", code: "1510", name: "1510" },
  { id: "sub-2210", parent_id: "cat-komputer", type: "SUB_USE", code: "2210", name: "2210" },
  { id: "sub-3020", parent_id: "cat-komputer", type: "SUB_USE", code: "3020", name: "3020" },
  { id: "sub-4030", parent_id: "cat-komputer", type: "SUB_USE", code: "4030", name: "4030" },
  { id: "sub-4530", parent_id: "cat-komputer", type: "SUB_USE", code: "4530", name: "4530" },

  // SUB_USE (B) for LISTRIK
  { id: "sub-lis-sen", parent_id: "cat-listrik", type: "SUB_USE", code: "SENSOR", name: "SENSOR" },
  { id: "sub-lis-inv", parent_id: "cat-listrik", type: "SUB_USE", code: "INVERTER", name: "INVERTER" },
  { id: "sub-lis-relay", parent_id: "cat-listrik", type: "SUB_USE", code: "RELAY_CONTACTOR", name: "RELAY_CONTACTOR" },
  { id: "sub-lis-power", parent_id: "cat-listrik", type: "SUB_USE", code: "NGUON_POWER_SUPPLY", name: "NGUON_POWER_SUPPLY" },

  // SUB_USE (B) for PNEUMATIC
  { id: "sub-pneu-val", parent_id: "cat-pneumatic", type: "SUB_USE", code: "SOLENOID_VALVE", name: "SOLENOID_VALVE" },
  { id: "sub-pneu-cyl", parent_id: "cat-pneumatic", type: "SUB_USE", code: "CYLINDER", name: "CYLINDER" },
  { id: "sub-pneu-fit", parent_id: "cat-pneumatic", type: "SUB_USE", code: "FITTING_ONG_HOI", name: "FITTING_ONG_HOI" },
  { id: "sub-pneu-reg", parent_id: "cat-pneumatic", type: "SUB_USE", code: "BO_LOC_DIEU_AP", name: "BO_LOC_DIEU_AP" },

  // SUB_USE (B) for MRO
  { id: "sub-mro-oil", parent_id: "cat-mro", type: "SUB_USE", code: "DAU_MO_BOI_TRON", name: "DAU_MO_BOI_TRON" },
  { id: "sub-mro-tool", parent_id: "cat-mro", type: "SUB_USE", code: "TOOL_DO_NGHE", name: "TOOL_DO_NGHE" },
  { id: "sub-mro-chem", parent_id: "cat-mro", type: "SUB_USE", code: "HOA_CHAT_KEO_DAN", name: "HOA_CHAT_KEO_DAN" },

  // SUB_USE (B) for MESIN PRODUCSI
  { id: "sub-prod-conveyor", parent_id: "cat-mesin-produksi", type: "SUB_USE", code: "BANG_TAI", name: "BANG_TAI" },
  { id: "sub-prod-motor", parent_id: "cat-mesin-produksi", type: "SUB_USE", code: "DONG_CO_GIAM_TOC", name: "DONG_CO_GIAM_TOC" },
  { id: "sub-prod-bearing", parent_id: "cat-mesin-produksi", type: "SUB_USE", code: "VONG_BI_BAC_DAN", name: "VONG_BI_BAC_DAN" },
  { id: "sub-prod-trans", parent_id: "cat-mesin-produksi", type: "SUB_USE", code: "XICH_KHOP_NOI", name: "XICH_KHOP_NOI" },

  // MACHINE_CODE (C)
  { id: "mc-km250", parent_id: null, type: "MACHINE_CODE", code: "KM-250", name: "KM-250" },
  { id: "mc-ddl8700", parent_id: null, type: "MACHINE_CODE", code: "DDL-8700", name: "DDL-8700" },
  { id: "mc-lh3168", parent_id: null, type: "MACHINE_CODE", code: "LH-3168", name: "LH-3168" },
  { id: "mc-lk1900", parent_id: null, type: "MACHINE_CODE", code: "LK-1900", name: "LK-1900" },
  { id: "mc-ams210", parent_id: null, type: "MACHINE_CODE", code: "AMS-210EN", name: "AMS-210EN" },
  { id: "mc-mo6800", parent_id: null, type: "MACHINE_CODE", code: "MO-6800", name: "MO-6800" },
  { id: "mc-bas311", parent_id: null, type: "MACHINE_CODE", code: "BAS-311HN", name: "BAS-311HN" },
  { id: "mc-ddl9000", parent_id: null, type: "MACHINE_CODE", code: "DDL-9000C", name: "DDL-9000C" },
  { id: "mc-s7200", parent_id: null, type: "MACHINE_CODE", code: "S-7200C", name: "S-7200C" },

  // MACHINE_TYPE (D)
  { id: "mt-sn", parent_id: null, type: "MACHINE_TYPE", code: "SINGLE_NEEDLE", name: "SINGLE_NEEDLE" },
  { id: "mt-dn", parent_id: null, type: "MACHINE_TYPE", code: "DOUBLE_NEEDLE", name: "DOUBLE_NEEDLE" },
  { id: "mt-bt", parent_id: null, type: "MACHINE_TYPE", code: "BARTACK", name: "BARTACK" },
  { id: "mt-ol", parent_id: null, type: "MACHINE_TYPE", code: "OVERLOCK", name: "OVERLOCK" },
  { id: "mt-ps", parent_id: null, type: "MACHINE_TYPE", code: "PATTERN_SEAMER", name: "PATTERN_SEAMER" },

  // MACHINE_BRAND (E)
  { id: "mb-juki", parent_id: null, type: "MACHINE_BRAND", code: "JUKI", name: "JUKI" },
  { id: "mb-brother", parent_id: null, type: "MACHINE_BRAND", code: "BROTHER", name: "BROTHER" },
  { id: "mb-sunstar", parent_id: null, type: "MACHINE_BRAND", code: "SUNSTAR", name: "SUNSTAR" },
  { id: "mb-pegasus", parent_id: null, type: "MACHINE_BRAND", code: "PEGASUS", name: "PEGASUS" },
  { id: "mb-siruba", parent_id: null, type: "MACHINE_BRAND", code: "SIRUBA", name: "SIRUBA" },
  { id: "mb-jack", parent_id: null, type: "MACHINE_BRAND", code: "JACK", name: "JACK" },
  { id: "mb-smc", parent_id: null, type: "MACHINE_BRAND", code: "SMC", name: "SMC" },
  { id: "mb-festo", parent_id: null, type: "MACHINE_BRAND", code: "FESTO", name: "FESTO" },
  { id: "mb-omron", parent_id: null, type: "MACHINE_BRAND", code: "OMRON", name: "OMRON" },
  { id: "mb-airtac", parent_id: null, type: "MACHINE_BRAND", code: "AIRTAC", name: "AIRTAC" },
  { id: "mb-keyence", parent_id: null, type: "MACHINE_BRAND", code: "KEYENCE", name: "KEYENCE" },
  { id: "mb-mobil", parent_id: null, type: "MACHINE_BRAND", code: "MOBIL", name: "MOBIL" },
  { id: "mb-nsk", parent_id: null, type: "MACHINE_BRAND", code: "NSK", name: "NSK" },
  { id: "mb-tunglee", parent_id: null, type: "MACHINE_BRAND", code: "TUNGLEE", name: "TUNGLEE" },
];

export const INITIAL_LOCATIONS: StorageLocation[] = [
  { id: "loc-a-1-1", group_code: "A", column_no: 1, row_no: 1, barcode: "LOC-A-01-01", note: "Kệ phụ tùng JUKI 1 kim" },
  { id: "loc-a-1-2", group_code: "A", column_no: 1, row_no: 2, barcode: "LOC-A-01-02", note: "Kệ phụ tùng JUKI 2 kim" },
  { id: "loc-a-2-1", group_code: "A", column_no: 2, row_no: 1, barcode: "LOC-A-02-01", note: "Kệ dao xén và kim" },
  { id: "loc-a-2-2", group_code: "A", column_no: 2, row_no: 2, barcode: "LOC-A-02-02", note: "Kệ ổ chao & thuyền thoi" },
  { id: "loc-b-1-1", group_code: "B", column_no: 1, row_no: 1, barcode: "LOC-B-01-01", note: "Kệ máy vi tính 1510/2210" },
  { id: "loc-b-1-2", group_code: "B", column_no: 1, row_no: 2, barcode: "LOC-B-01-02", note: "Kệ máy vi tính 3020/4030" },
  { id: "loc-c-1-1", group_code: "C", column_no: 1, row_no: 1, barcode: "LOC-C-01-01", note: "Kệ khí nén & Fitting" },
  { id: "loc-c-2-1", group_code: "C", column_no: 2, row_no: 1, barcode: "LOC-C-02-01", note: "Kệ xylanh & Solenoid Valve" },
  { id: "loc-d-1-1", group_code: "D", column_no: 1, row_no: 1, barcode: "LOC-D-01-01", note: "Kệ linh kiện điện & Sensor" },
  { id: "loc-g-1-1", group_code: "G", column_no: 1, row_no: 1, barcode: "LOC-G-01-01", note: "Kệ dầu mỡ & đồ nghề MRO" },
  { id: "loc-k-1-1", group_code: "K", column_no: 1, row_no: 1, barcode: "LOC-K-01-01", note: "Kệ máy sản xuất & vòng bi" },
];

export const INITIAL_PARTS: SparePart[] = [
  // ================= 1. SEWING (7 items) =================
  {
    id: "SP-SEW-001",
    part_name: "Rotary Hook Hirose HSH-7.94BTR (Ổ chao máy may)",
    main_cat_id: "cat-sewing",
    sub_cat_id: "sub-jarum-1",
    machine_code: "DDL-8700",
    machine_type: "Single Needle Lockstitch",
    machine_brand: "JUKI",
    location_id: "loc-a-2-2",
    unit: "PCS",
    min_limit: 5,
    max_limit: 25,
    custom_fields: { "Xuất xứ": "Japan Hirose", "Loại máy": "1 Kim Juki" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-SEW-002",
    part_name: "Needle Plate E18 (Mặt nguyệt 1 kim chuẩn)",
    main_cat_id: "cat-sewing",
    sub_cat_id: "sub-jarum-1",
    machine_code: "KM-250",
    machine_type: "Single Needle Lockstitch",
    machine_brand: "SUNSTAR",
    location_id: "loc-a-1-1",
    unit: "PCS",
    min_limit: 8,
    max_limit: 40,
    custom_fields: { "Kích thước lỗ": "1.8 mm", "Vật liệu": "Thép tôi cứng" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-SEW-003",
    part_name: "Bobbin Case Towa Japan (Thuyền thoi chuẩn)",
    main_cat_id: "cat-sewing",
    sub_cat_id: "sub-jarum-1",
    machine_code: "DDL-8700",
    machine_type: "Single Needle Lockstitch",
    machine_brand: "JUKI",
    location_id: "loc-a-2-2",
    unit: "PCS",
    min_limit: 10,
    max_limit: 50,
    custom_fields: { "Hãng": "Towa", "Có lò xo chống lồng": "Có" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-SEW-004",
    part_name: "Thread Trimmer Moving Knife (Dao xén cắt chỉ động)",
    main_cat_id: "cat-sewing",
    sub_cat_id: "sub-jarum-1",
    machine_code: "DDL-8700",
    machine_type: "Single Needle Lockstitch",
    machine_brand: "JUKI",
    location_id: "loc-a-2-1",
    unit: "PCS",
    min_limit: 6,
    max_limit: 30,
    custom_fields: { "Part No Juki": "110-40052", "Tương thích": "DDL-8700-7" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-SEW-005",
    part_name: "Presser Foot Hinged Standard 1/8 (Chân vịt mí)",
    main_cat_id: "cat-sewing",
    sub_cat_id: "sub-jarum-2",
    machine_code: "LH-3168",
    machine_type: "Double Needle Lockstitch",
    machine_brand: "JUKI",
    location_id: "loc-a-1-2",
    unit: "PCS",
    min_limit: 4,
    max_limit: 20,
    custom_fields: { "Cự ly": "1/4 inch", "Quy cách": "Có mui dẫn hướng" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-SEW-006",
    part_name: "Feed Dog B24 (Cầu răng cưa đẩy vải 1 kim)",
    main_cat_id: "cat-sewing",
    sub_cat_id: "sub-jarum-1",
    machine_code: "DDL-8700",
    machine_type: "Single Needle Lockstitch",
    machine_brand: "JUKI",
    location_id: "loc-a-1-1",
    unit: "PCS",
    min_limit: 8,
    max_limit: 35,
    custom_fields: { "Răng cưa": "3 cầu mịn", "Quy cách": "DDL-8700" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-SEW-007",
    part_name: "Upper Looper Pegasus M700 (Móc trên máy vắt sổ)",
    main_cat_id: "cat-sewing",
    sub_cat_id: "sub-obras",
    machine_code: "MO-6800",
    machine_type: "Overlock Machine",
    machine_brand: "PEGASUS",
    location_id: "loc-a-2-1",
    unit: "PCS",
    min_limit: 8,
    max_limit: 30,
    custom_fields: { "Part No": "204072", "Chất liệu": "Hợp kim tôi cứng" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },

  // ================= 2. KOMPUTER SEWING (7 items) =================
  {
    id: "SP-KOM-001",
    part_name: "Pneumatic Clamp Frame Cylinder 3020 (Xylanh kẹp rập)",
    main_cat_id: "cat-komputer",
    sub_cat_id: "sub-3020",
    machine_code: "AMS-210EN",
    machine_type: "Automated Pattern Seamer",
    machine_brand: "JUKI",
    location_id: "loc-b-1-2",
    unit: "PCS",
    min_limit: 3,
    max_limit: 10,
    custom_fields: { "Hành trình": "40mm", "Áp suất": "0.5-0.7 MPa" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-KOM-002",
    part_name: "Ceramic Thread Guide Ring 1510 (Mắt ngọc sứ dẫn chỉ)",
    main_cat_id: "cat-komputer",
    sub_cat_id: "sub-1510",
    machine_code: "BAS-311HN",
    machine_type: "Automated Pattern Seamer",
    machine_brand: "BROTHER",
    location_id: "loc-b-1-1",
    unit: "PCS",
    min_limit: 12,
    max_limit: 60,
    custom_fields: { "Chất liệu": "Gốm Zirconia trắng", "Đường kính ngoài": "8mm" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-KOM-003",
    part_name: "Stepper Motor Driver Board 2210 (Board công suất driver)",
    main_cat_id: "cat-komputer",
    sub_cat_id: "sub-2210",
    machine_code: "AMS-210EN",
    machine_type: "Automated Pattern Seamer",
    machine_brand: "JUKI",
    location_id: "loc-b-1-1",
    unit: "PCS",
    min_limit: 2,
    max_limit: 8,
    custom_fields: { "Điện áp": "DC 48V", "Model": "MD-2210J" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-KOM-004",
    part_name: "Laser Pointer Positioning Lamp (Đèn định vị laser chữ thập)",
    main_cat_id: "cat-komputer",
    sub_cat_id: "sub-3020",
    machine_code: "BAS-311HN",
    machine_type: "Automated Pattern Seamer",
    machine_brand: "BROTHER",
    location_id: "loc-b-1-2",
    unit: "PCS",
    min_limit: 5,
    max_limit: 15,
    custom_fields: { "Tia": "Laser Đỏ chữ thập", "Nguồn": "5V DC" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-KOM-005",
    part_name: "Rotary Solenoid Cutter 4030 (Cuộn hút dao cắt chỉ vi tính)",
    main_cat_id: "cat-komputer",
    sub_cat_id: "sub-4030",
    machine_code: "AMS-210EN",
    machine_type: "Automated Pattern Seamer",
    machine_brand: "JUKI",
    location_id: "loc-b-1-2",
    unit: "PCS",
    min_limit: 3,
    max_limit: 10,
    custom_fields: { "Cuộn hút": "24V 35W", "Kiểu tác động": "Xoay góc 45 độ" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-KOM-006",
    part_name: "Touch Screen Panel LCD 4530 (Màn hình điều khiển cảm ứng)",
    main_cat_id: "cat-komputer",
    sub_cat_id: "sub-4530",
    machine_code: "BAS-311HN",
    machine_type: "Automated Pattern Seamer",
    machine_brand: "BROTHER",
    location_id: "loc-b-1-2",
    unit: "PCS",
    min_limit: 2,
    max_limit: 6,
    custom_fields: { "Kích thước": "7 inch màu", "Giao thức": "RS-485" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-KOM-007",
    part_name: "Aluminium Clamp Jig Plate 3020 (Tấm gá kẹp rập nhôm vi tính)",
    main_cat_id: "cat-komputer",
    sub_cat_id: "sub-3020",
    machine_code: "AMS-210EN",
    machine_type: "Automated Pattern Seamer",
    machine_brand: "JUKI",
    location_id: "loc-b-1-2",
    unit: "PCS",
    min_limit: 4,
    max_limit: 16,
    custom_fields: { "Quy cách": "300x200 mm", "Vật liệu": "Nhôm Anode 6061" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },

  // ================= 3. LISTRIK (7 items) =================
  {
    id: "SP-ELE-001",
    part_name: "Optical Fiber Sensor Keyence FU-77 (Cảm biến quang sợi)",
    main_cat_id: "cat-listrik",
    sub_cat_id: "sub-lis-sen",
    machine_code: "AMS-210EN",
    machine_type: "Automated Pattern Seamer",
    machine_brand: "KEYENCE",
    location_id: "loc-d-1-1",
    unit: "PCS",
    min_limit: 4,
    max_limit: 12,
    custom_fields: { "Loại": "Phản xạ khuếch tán", "Hãng": "Keyence" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-ELE-002",
    part_name: "Inductive Proximity Sensor Omron E2E (Cảm biến tiệm cận từ)",
    main_cat_id: "cat-listrik",
    sub_cat_id: "sub-lis-sen",
    machine_code: "AMS-210EN",
    machine_type: "Sensors",
    machine_brand: "OMRON",
    location_id: "loc-d-1-1",
    unit: "PCS",
    min_limit: 6,
    max_limit: 20,
    custom_fields: { "Khoảng cách": "5mm", "Ren": "M12", "Ngõ ra": "DC 3 dây NPN" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-ELE-003",
    part_name: "Solid State Relay SSR 40A Fotek (Rơ le bán dẫn gia nhiệt)",
    main_cat_id: "cat-listrik",
    sub_cat_id: "sub-lis-relay",
    machine_code: "KM-250",
    machine_type: "Electric",
    machine_brand: "OMRON",
    location_id: "loc-d-1-1",
    unit: "PCS",
    min_limit: 4,
    max_limit: 15,
    custom_fields: { "Dòng tải": "40A", "Điều khiển": "3-32VDC", "Điện áp tải": "24-380VAC" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-ELE-004",
    part_name: "Switching Power Supply 24V 10A MeanWell (Nguồn tổ ong 24VDC)",
    main_cat_id: "cat-listrik",
    sub_cat_id: "sub-lis-power",
    machine_code: "BAS-311HN",
    machine_type: "Power Supply",
    machine_brand: "OMRON",
    location_id: "loc-d-1-1",
    unit: "PCS",
    min_limit: 3,
    max_limit: 10,
    custom_fields: { "Công suất": "240W", "Điện áp vào": "100-240VAC", "Ra": "24V 10A" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-ELE-005",
    part_name: "Inverter VFD 1.5kW 3-Phase Delta (Biến tần điều tốc motor)",
    main_cat_id: "cat-listrik",
    sub_cat_id: "sub-lis-inv",
    machine_code: "DDL-9000C",
    machine_type: "Motor & Driver",
    machine_brand: "SUNSTAR",
    location_id: "loc-d-1-1",
    unit: "PCS",
    min_limit: 2,
    max_limit: 6,
    custom_fields: { "Công suất": "1.5kW (2HP)", "Điện áp": "3 Pha 380V" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-ELE-006",
    part_name: "Miniature Circuit Breaker MCB 2P 16A Schneider (Aptomat tép 16A)",
    main_cat_id: "cat-listrik",
    sub_cat_id: "sub-lis-power",
    machine_code: "KM-250",
    machine_type: "Breaker",
    machine_brand: "OMRON",
    location_id: "loc-d-1-1",
    unit: "PCS",
    min_limit: 8,
    max_limit: 30,
    custom_fields: { "Dòng cắt": "6kA", "Dòng định mức": "16A 2 Cực" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-ELE-007",
    part_name: "Foot Switch Pedal Aluminium HRF-MD2 (Công tắc bàn đạp dậm chân)",
    main_cat_id: "cat-listrik",
    sub_cat_id: "sub-lis-sen",
    machine_code: "DDL-8700",
    machine_type: "Switch",
    machine_brand: "JUKI",
    location_id: "loc-d-1-1",
    unit: "PCS",
    min_limit: 5,
    max_limit: 20,
    custom_fields: { "Vỏ": "Hợp kim nhôm đúc", "Tiếp điểm": "1NO + 1NC 10A" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },

  // ================= 4. PNEUMATIC (7 items) =================
  {
    id: "SP-PNE-001",
    part_name: "One-Touch Fitting AirTAC 8-02 (Cút nối nhanh khí nén ren 1/4)",
    main_cat_id: "cat-pneumatic",
    sub_cat_id: "sub-pneu-fit",
    machine_code: "KM-250",
    machine_type: "Pneumatics",
    machine_brand: "AIRTAC",
    location_id: "loc-c-1-1",
    unit: "PCS",
    min_limit: 20,
    max_limit: 100,
    custom_fields: { "Ống": "Phi 8", "Ren": "PT 1/4 inch", "Hãng": "AirTAC" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PNE-002",
    part_name: "Solenoid Valve 24VDC SMC 5/2 (Van điện từ khí nén)",
    main_cat_id: "cat-pneumatic",
    sub_cat_id: "sub-pneu-val",
    machine_code: "LK-1900",
    machine_type: "Bartack Machine",
    machine_brand: "SMC",
    location_id: "loc-c-2-1",
    unit: "PCS",
    min_limit: 5,
    max_limit: 15,
    custom_fields: { "Điện áp": "24V DC", "Hãng": "SMC Japan", "Kiểu van": "5/2 single" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PNE-003",
    part_name: "Compact Air Cylinder CDQ2B 20-30D (Xylanh khí nén SMC)",
    main_cat_id: "cat-pneumatic",
    sub_cat_id: "sub-pneu-cyl",
    machine_code: "LK-1900",
    machine_type: "Bartack Machine",
    machine_brand: "SMC",
    location_id: "loc-c-2-1",
    unit: "PCS",
    min_limit: 4,
    max_limit: 12,
    custom_fields: { "Nòng": "20mm", "Hành trình": "30mm", "Có từ": "Có cảm biến từ" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PNE-004",
    part_name: "Air Filter Regulator AFR-2000 (Bộ lọc điều áp khí nén AirTAC)",
    main_cat_id: "cat-pneumatic",
    sub_cat_id: "sub-pneu-reg",
    machine_code: "DDL-9000C",
    machine_type: "Pneumatics",
    machine_brand: "AIRTAC",
    location_id: "loc-c-1-1",
    unit: "PCS",
    min_limit: 3,
    max_limit: 10,
    custom_fields: { "Dải áp": "0.05-0.85 MPa", "Cỡ ren": "G 1/4" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PNE-005",
    part_name: "Polyurethane Tube PU 8x5mm Blue (Cuộn ống hơi xanh phi 8)",
    main_cat_id: "cat-pneumatic",
    sub_cat_id: "sub-pneu-fit",
    machine_code: "AMS-210EN",
    machine_type: "Pneumatics",
    machine_brand: "SMC",
    location_id: "loc-c-1-1",
    unit: "CUON",
    min_limit: 5,
    max_limit: 20,
    custom_fields: { "Chiều dài": "100 mét/cuộn", "Áp suất max": "1.0 MPa" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PNE-006",
    part_name: "Speed Controller AS2201F-02-08S (Van tiết lưu điều tốc khí)",
    main_cat_id: "cat-pneumatic",
    sub_cat_id: "sub-pneu-val",
    machine_code: "LK-1900",
    machine_type: "Pneumatics",
    machine_brand: "SMC",
    location_id: "loc-c-1-1",
    unit: "PCS",
    min_limit: 15,
    max_limit: 60,
    custom_fields: { "Đường kính": "Phi 8", "Ren": "R 1/4", "Kiểu": "Bắt thân xylanh" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PNE-007",
    part_name: "Digital Pressure Switch SMC ZSE30A (Cảm biến áp suất khí số)",
    main_cat_id: "cat-pneumatic",
    sub_cat_id: "sub-pneu-val",
    machine_code: "AMS-210EN",
    machine_type: "Pneumatics",
    machine_brand: "SMC",
    location_id: "loc-c-2-1",
    unit: "PCS",
    min_limit: 2,
    max_limit: 8,
    custom_fields: { "Màn hình": "LED 2 màu", "Ngõ ra": "NPN kép" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },

  // ================= 5. MRO (7 items) =================
  {
    id: "SP-MRO-001",
    part_name: "Mobil Velocite No 3 White Oil 18L (Dầu máy may trắng thùng 18L)",
    main_cat_id: "cat-mro",
    sub_cat_id: "sub-mro-oil",
    machine_code: "DDL-8700",
    machine_type: "Lubricant",
    machine_brand: "MOBIL",
    location_id: "loc-g-1-1",
    unit: "THUNG",
    min_limit: 4,
    max_limit: 15,
    custom_fields: { "Độ nhớt": "ISO VG 2", "Dung tích": "18 Lít", "Độ tinh khiết": "Trắng không màu" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-MRO-002",
    part_name: "High Temp Grease Kluber Isoflex Topas (Mỡ bôi trơn tốc độ cao 1kg)",
    main_cat_id: "cat-mro",
    sub_cat_id: "sub-mro-oil",
    machine_code: "AMS-210EN",
    machine_type: "Grease",
    machine_brand: "MOBIL",
    location_id: "loc-g-1-1",
    unit: "HOP",
    min_limit: 3,
    max_limit: 10,
    custom_fields: { "Quy cách": "Hộp 1kg", "Chịu nhiệt": "-50 đến 150 độ C", "Ứng dụng": "Vòng bi tốc độ cao" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-MRO-003",
    part_name: "WD-40 Penetrating Spray 412ml (Chai xịt tẩy rỉ sét bôi trơn)",
    main_cat_id: "cat-mro",
    sub_cat_id: "sub-mro-oil",
    machine_code: "KM-250",
    machine_type: "Chemicals",
    machine_brand: "MOBIL",
    location_id: "loc-g-1-1",
    unit: "CHAI",
    min_limit: 12,
    max_limit: 48,
    custom_fields: { "Thể tích": "412 ml", "Xuất xứ": "USA", "Công dụng": "Tẩy rỉ, bôi trơn bản lề" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-MRO-004",
    part_name: "Threadlocker Loctite 243 Blue 50ml (Keo khóa ren chống xoay lỏng)",
    main_cat_id: "cat-mro",
    sub_cat_id: "sub-mro-chem",
    machine_code: "LH-3168",
    machine_type: "Adhesive",
    machine_brand: "MOBIL",
    location_id: "loc-g-1-1",
    unit: "CHAI",
    min_limit: 5,
    max_limit: 20,
    custom_fields: { "Dung tích": "50 ml", "Màu keo": "Xanh dương (Medium strength)", "Cỡ ren": "M6 đến M20" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-MRO-005",
    part_name: "Hex Key Wrench Set 1.5-10mm Eight Japan (Bộ lục giác bông cao cấp)",
    main_cat_id: "cat-mro",
    sub_cat_id: "sub-mro-tool",
    machine_code: "DDL-8700",
    machine_type: "Hand Tools",
    machine_brand: "JUKI",
    location_id: "loc-g-1-1",
    unit: "BO",
    min_limit: 4,
    max_limit: 12,
    custom_fields: { "Xuất xứ": "Japan Eight", "Số chi tiết": "9 cây (1.5 - 10mm)", "Vật liệu": "SNCM+V thép hợp kim" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-MRO-006",
    part_name: "Digital Caliper 150mm Mitutoyo 500-196-30 (Thước kẹp cơ khí điện tử)",
    main_cat_id: "cat-mro",
    sub_cat_id: "sub-mro-tool",
    machine_code: "AMS-210EN",
    machine_type: "Measuring Tools",
    machine_brand: "JUKI",
    location_id: "loc-g-1-1",
    unit: "CAI",
    min_limit: 2,
    max_limit: 6,
    custom_fields: { "Dải đo": "0 - 150mm", "Độ chia": "0.01mm", "Thương hiệu": "Mitutoyo Japan" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-MRO-007",
    part_name: "Machine Cleaning Air Blow Gun (Súng xịt khí nén vệ sinh xơ chỉ)",
    main_cat_id: "cat-mro",
    sub_cat_id: "sub-mro-tool",
    machine_code: "KM-250",
    machine_type: "Pneumatic Tools",
    machine_brand: "AIRTAC",
    location_id: "loc-g-1-1",
    unit: "CAI",
    min_limit: 6,
    max_limit: 25,
    custom_fields: { "Đầu vòi": "Dài 100mm kim loại", "Khớp nối": "Cút nhanh 1/4 inch" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },

  // ================= 6. MESIN PRODUCSI (7 items) =================
  {
    id: "SP-PRD-001",
    part_name: "Conveyor PVC Belt Green 2mm (Băng tải PVC xanh dán chuyền may)",
    main_cat_id: "cat-mesin-produksi",
    sub_cat_id: "sub-prod-conveyor",
    machine_code: "KM-250",
    machine_type: "Production Conveyor",
    machine_brand: "SUNSTAR",
    location_id: "loc-k-1-1",
    unit: "MET",
    min_limit: 15,
    max_limit: 60,
    custom_fields: { "Bản rộng": "400mm", "Độ dày": "2.0 mm", "Mặt trên": "Chống tĩnh điện trơn" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PRD-002",
    part_name: "Gear Motor 3-Phase 0.75kW Tunglee (Động cơ giảm tốc chuyền tải)",
    main_cat_id: "cat-mesin-produksi",
    sub_cat_id: "sub-prod-motor",
    machine_code: "DDL-8700",
    machine_type: "Conveyor Drive",
    machine_brand: "TUNGLEE",
    location_id: "loc-k-1-1",
    unit: "BO",
    min_limit: 2,
    max_limit: 6,
    custom_fields: { "Công suất": "0.75kW (1HP)", "Tỉ số truyền": "1/30", "Điện áp": "380V 50Hz" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PRD-003",
    part_name: "Deep Groove Ball Bearing NSK 6204ZZ (Vòng bi bạc đạn nắp sắt)",
    main_cat_id: "cat-mesin-produksi",
    sub_cat_id: "sub-prod-bearing",
    machine_code: "LH-3168",
    machine_type: "Bearing",
    machine_brand: "NSK",
    location_id: "loc-k-1-1",
    unit: "PCS",
    min_limit: 10,
    max_limit: 40,
    custom_fields: { "Kích thước": "20x47x14 mm", "Nắp che": "2 nắp sắt chống bụi", "Hãng": "NSK Japan" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PRD-004",
    part_name: "Drive Roller Chain RS40-1R Tsubaki (Xích truyền động đơn bước 40)",
    main_cat_id: "cat-mesin-produksi",
    sub_cat_id: "sub-prod-trans",
    machine_code: "KM-250",
    machine_type: "Transmission",
    machine_brand: "SUNSTAR",
    location_id: "loc-k-1-1",
    unit: "MET",
    min_limit: 8,
    max_limit: 30,
    custom_fields: { "Bước xích": "12.7 mm", "Tiêu chuẩn": "ANSI B29.1", "Hãng": "Tsubaki Japan" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PRD-005",
    part_name: "Flexible Jaw Shaft Coupling D30-L40 (Khớp nối trục nhôm đệm cao su)",
    main_cat_id: "cat-mesin-produksi",
    sub_cat_id: "sub-prod-trans",
    machine_code: "AMS-210EN",
    machine_type: "Coupling",
    machine_brand: "SUNSTAR",
    location_id: "loc-k-1-1",
    unit: "PCS",
    min_limit: 4,
    max_limit: 16,
    custom_fields: { "Đường kính ngoài": "30mm", "Chiều dài": "40mm", "Lỗ trục": "d1=10mm d2=12mm" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PRD-006",
    part_name: "High Pressure Oil Seal NOK TC 25-47-8 (Phốt chặn dầu chịu nhiệt)",
    main_cat_id: "cat-mesin-produksi",
    sub_cat_id: "sub-prod-bearing",
    machine_code: "MO-6800",
    machine_type: "Oil Seal",
    machine_brand: "SUNSTAR",
    location_id: "loc-k-1-1",
    unit: "PCS",
    min_limit: 8,
    max_limit: 30,
    custom_fields: { "Kích thước": "25x47x8 mm", "Vật liệu": "Cao su NBR có lò xo", "Hãng": "NOK Japan" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  },
  {
    id: "SP-PRD-007",
    part_name: "RTD Temperature Sensor PT100 M6 (Cảm biến nhiệt độ máy ép mếch)",
    main_cat_id: "cat-mesin-produksi",
    sub_cat_id: "sub-prod-motor",
    machine_code: "BAS-311HN",
    machine_type: "Temperature Sensor",
    machine_brand: "OMRON",
    location_id: "loc-d-1-1",
    unit: "PCS",
    min_limit: 3,
    max_limit: 10,
    custom_fields: { "Dải đo": "0 - 400 độ C", "Ren bắt": "M6x1.0", "Dây cáp": "Bọc giáp inox 2m" },
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z"
  }
];

export const INITIAL_MONTHLY_LOGS: Record<string, MonthlyInventoryLog> = {
  // October 2026 data
  // --- 1. SEWING ---
  "2026-10_SP-SEW-001": {
    id: "2026-10_SP-SEW-001",
    month_key: "2026-10",
    part_id: "SP-SEW-001",
    beginning_stock: 12,
    received_in_month: 5,
    daily_issues: { "day_2": 2, "day_5": 3, "day_8": 2, "day_14": 4, "day_18": 5 },
    total_issue: 16,
    current_stock: 1, // Alert <= 5
    notes: "Cần đặt thêm gấp ổ chao Juki",
    last_updated: "2026-10-18T10:30:00Z"
  },
  "2026-10_SP-SEW-002": {
    id: "2026-10_SP-SEW-002",
    month_key: "2026-10",
    part_id: "SP-SEW-002",
    beginning_stock: 25,
    received_in_month: 10,
    daily_issues: { "day_3": 1, "day_7": 2, "day_12": 1, "day_15": 2 },
    total_issue: 6,
    current_stock: 29,
    notes: "Tồn kho dồi dào",
    last_updated: "2026-10-15T14:15:00Z"
  },
  "2026-10_SP-SEW-003": {
    id: "2026-10_SP-SEW-003",
    month_key: "2026-10",
    part_id: "SP-SEW-003",
    beginning_stock: 15,
    received_in_month: 0,
    daily_issues: { "day_4": 3, "day_9": 4, "day_16": 2 },
    total_issue: 9,
    current_stock: 6, // Alert <= 10
    notes: "Đang yêu cầu phòng mua hàng SO",
    last_updated: "2026-10-16T09:20:00Z"
  },
  "2026-10_SP-SEW-004": {
    id: "2026-10_SP-SEW-004",
    month_key: "2026-10",
    part_id: "SP-SEW-004",
    beginning_stock: 14,
    received_in_month: 8,
    daily_issues: { "day_6": 2, "day_10": 2, "day_17": 3 },
    total_issue: 7,
    current_stock: 15,
    notes: "Bình thường",
    last_updated: "2026-10-17T11:00:00Z"
  },
  "2026-10_SP-SEW-005": {
    id: "2026-10_SP-SEW-005",
    month_key: "2026-10",
    part_id: "SP-SEW-005",
    beginning_stock: 8,
    received_in_month: 0,
    daily_issues: { "day_5": 2, "day_11": 3, "day_19": 1 },
    total_issue: 6,
    current_stock: 2, // Alert <= 4
    notes: "Cần mua bổ sung chân vịt mí 1/4",
    last_updated: "2026-10-19T08:45:00Z"
  },
  "2026-10_SP-SEW-006": {
    id: "2026-10_SP-SEW-006",
    month_key: "2026-10",
    part_id: "SP-SEW-006",
    beginning_stock: 20,
    received_in_month: 10,
    daily_issues: { "day_2": 2, "day_8": 3, "day_15": 2, "day_21": 3 },
    total_issue: 10,
    current_stock: 20,
    notes: "Cầu răng cưa Juki đủ dùng",
    last_updated: "2026-10-21T09:00:00Z"
  },
  "2026-10_SP-SEW-007": {
    id: "2026-10_SP-SEW-007",
    month_key: "2026-10",
    part_id: "SP-SEW-007",
    beginning_stock: 11,
    received_in_month: 0,
    daily_issues: { "day_5": 2, "day_9": 3, "day_15": 2 },
    total_issue: 7,
    current_stock: 4, // Alert <= 8
    notes: "Thay định kỳ chuyền vắt sổ",
    last_updated: "2026-10-15T11:20:00Z"
  },

  // --- 2. KOMPUTER SEWING ---
  "2026-10_SP-KOM-001": {
    id: "2026-10_SP-KOM-001",
    month_key: "2026-10",
    part_id: "SP-KOM-001",
    beginning_stock: 6,
    received_in_month: 2,
    daily_issues: { "day_8": 1, "day_13": 1 },
    total_issue: 2,
    current_stock: 6,
    notes: "Đạt chuẩn an toàn",
    last_updated: "2026-10-13T16:00:00Z"
  },
  "2026-10_SP-KOM-002": {
    id: "2026-10_SP-KOM-002",
    month_key: "2026-10",
    part_id: "SP-KOM-002",
    beginning_stock: 35,
    received_in_month: 0,
    daily_issues: { "day_2": 5, "day_9": 4, "day_16": 6 },
    total_issue: 15,
    current_stock: 20,
    notes: "Đủ dùng đến cuối tháng",
    last_updated: "2026-10-16T15:10:00Z"
  },
  "2026-10_SP-KOM-003": {
    id: "2026-10_SP-KOM-003",
    month_key: "2026-10",
    part_id: "SP-KOM-003",
    beginning_stock: 4,
    received_in_month: 2,
    daily_issues: { "day_6": 1, "day_17": 1 },
    total_issue: 2,
    current_stock: 4,
    notes: "Board driver dự phòng sẵn",
    last_updated: "2026-10-17T14:00:00Z"
  },
  "2026-10_SP-KOM-004": {
    id: "2026-10_SP-KOM-004",
    month_key: "2026-10",
    part_id: "SP-KOM-004",
    beginning_stock: 12,
    received_in_month: 5,
    daily_issues: { "day_4": 2, "day_11": 2, "day_18": 3 },
    total_issue: 7,
    current_stock: 10,
    notes: "Đèn định vị hoạt động tốt",
    last_updated: "2026-10-18T16:20:00Z"
  },
  "2026-10_SP-KOM-005": {
    id: "2026-10_SP-KOM-005",
    month_key: "2026-10",
    part_id: "SP-KOM-005",
    beginning_stock: 5,
    received_in_month: 0,
    daily_issues: { "day_7": 1, "day_14": 1, "day_20": 1 },
    total_issue: 3,
    current_stock: 2, // Alert <= 3
    notes: "Cuộn hút dao cắt chỉ sắp hết",
    last_updated: "2026-10-20T10:15:00Z"
  },
  "2026-10_SP-KOM-006": {
    id: "2026-10_SP-KOM-006",
    month_key: "2026-10",
    part_id: "SP-KOM-006",
    beginning_stock: 3,
    received_in_month: 1,
    daily_issues: { "day_12": 1 },
    total_issue: 1,
    current_stock: 3,
    notes: "Màn hình LCD Brother",
    last_updated: "2026-10-12T11:45:00Z"
  },
  "2026-10_SP-KOM-007": {
    id: "2026-10_SP-KOM-007",
    month_key: "2026-10",
    part_id: "SP-KOM-007",
    beginning_stock: 8,
    received_in_month: 4,
    daily_issues: { "day_5": 1, "day_15": 2 },
    total_issue: 3,
    current_stock: 9,
    notes: "Gá kẹp rập nhôm xưởng 2",
    last_updated: "2026-10-15T15:30:00Z"
  },

  // --- 3. LISTRIK ---
  "2026-10_SP-ELE-001": {
    id: "2026-10_SP-ELE-001",
    month_key: "2026-10",
    part_id: "SP-ELE-001",
    beginning_stock: 5,
    received_in_month: 3,
    daily_issues: { "day_3": 1, "day_10": 2 },
    total_issue: 3,
    current_stock: 5,
    notes: "Cảm biến phòng may 3",
    last_updated: "2026-10-10T13:40:00Z"
  },
  "2026-10_SP-ELE-002": {
    id: "2026-10_SP-ELE-002",
    month_key: "2026-10",
    part_id: "SP-ELE-002",
    beginning_stock: 8,
    received_in_month: 4,
    daily_issues: { "day_4": 1, "day_12": 2, "day_19": 2 },
    total_issue: 5,
    current_stock: 7,
    notes: "Cảm biến tiệm cận Omron",
    last_updated: "2026-10-19T14:30:00Z"
  },
  "2026-10_SP-ELE-003": {
    id: "2026-10_SP-ELE-003",
    month_key: "2026-10",
    part_id: "SP-ELE-003",
    beginning_stock: 6,
    received_in_month: 0,
    daily_issues: { "day_7": 1, "day_16": 2 },
    total_issue: 3,
    current_stock: 3, // Alert <= 4
    notes: "SSR Fotek gia nhiệt nồi hơi",
    last_updated: "2026-10-16T10:15:00Z"
  },
  "2026-10_SP-ELE-004": {
    id: "2026-10_SP-ELE-004",
    month_key: "2026-10",
    part_id: "SP-ELE-004",
    beginning_stock: 5,
    received_in_month: 2,
    daily_issues: { "day_8": 1, "day_17": 1 },
    total_issue: 2,
    current_stock: 5,
    notes: "Nguồn MeanWell 24V tủ điện",
    last_updated: "2026-10-17T09:30:00Z"
  },
  "2026-10_SP-ELE-005": {
    id: "2026-10_SP-ELE-005",
    month_key: "2026-10",
    part_id: "SP-ELE-005",
    beginning_stock: 3,
    received_in_month: 0,
    daily_issues: { "day_13": 1 },
    total_issue: 1,
    current_stock: 2,
    notes: "Biến tần Delta chuyền may",
    last_updated: "2026-10-13T15:20:00Z"
  },
  "2026-10_SP-ELE-006": {
    id: "2026-10_SP-ELE-006",
    month_key: "2026-10",
    part_id: "SP-ELE-006",
    beginning_stock: 14,
    received_in_month: 6,
    daily_issues: { "day_2": 2, "day_11": 3, "day_20": 2 },
    total_issue: 7,
    current_stock: 13,
    notes: "Aptomat tép Schneider",
    last_updated: "2026-10-20T11:00:00Z"
  },
  "2026-10_SP-ELE-007": {
    id: "2026-10_SP-ELE-007",
    month_key: "2026-10",
    part_id: "SP-ELE-007",
    beginning_stock: 9,
    received_in_month: 0,
    daily_issues: { "day_6": 2, "day_15": 3 },
    total_issue: 5,
    current_stock: 4, // Alert <= 5
    notes: "Bàn đạp dậm chân máy may",
    last_updated: "2026-10-15T16:10:00Z"
  },

  // --- 4. PNEUMATIC ---
  "2026-10_SP-PNE-001": {
    id: "2026-10_SP-PNE-001",
    month_key: "2026-10",
    part_id: "SP-PNE-001",
    beginning_stock: 45,
    received_in_month: 20,
    daily_issues: { "day_1": 4, "day_4": 8, "day_8": 6, "day_12": 10, "day_15": 12, "day_19": 8 },
    total_issue: 48,
    current_stock: 17, // Alert <= 20
    notes: "Tiêu hao nhiều do bảo dưỡng toàn xưởng",
    last_updated: "2026-10-19T17:00:00Z"
  },
  "2026-10_SP-PNE-002": {
    id: "2026-10_SP-PNE-002",
    month_key: "2026-10",
    part_id: "SP-PNE-002",
    beginning_stock: 9,
    received_in_month: 0,
    daily_issues: { "day_7": 1, "day_14": 2 },
    total_issue: 3,
    current_stock: 6,
    notes: "Tồn an toàn",
    last_updated: "2026-10-14T10:00:00Z"
  },
  "2026-10_SP-PNE-003": {
    id: "2026-10_SP-PNE-003",
    month_key: "2026-10",
    part_id: "SP-PNE-003",
    beginning_stock: 6,
    received_in_month: 2,
    daily_issues: { "day_3": 1, "day_10": 1, "day_16": 1 },
    total_issue: 3,
    current_stock: 5,
    notes: "Xylanh SMC kẹp đính bọ",
    last_updated: "2026-10-16T11:20:00Z"
  },
  "2026-10_SP-PNE-004": {
    id: "2026-10_SP-PNE-004",
    month_key: "2026-10",
    part_id: "SP-PNE-004",
    beginning_stock: 4,
    received_in_month: 2,
    daily_issues: { "day_5": 1, "day_18": 1 },
    total_issue: 2,
    current_stock: 4,
    notes: "Bộ lọc khí đầu vào máy may",
    last_updated: "2026-10-18T13:40:00Z"
  },
  "2026-10_SP-PNE-005": {
    id: "2026-10_SP-PNE-005",
    month_key: "2026-10",
    part_id: "SP-PNE-005",
    beginning_stock: 10,
    received_in_month: 5,
    daily_issues: { "day_2": 2, "day_9": 2, "day_15": 3, "day_22": 2 },
    total_issue: 9,
    current_stock: 6,
    notes: "Cuộn ống hơi phi 8 xanh",
    last_updated: "2026-10-22T10:00:00Z"
  },
  "2026-10_SP-PNE-006": {
    id: "2026-10_SP-PNE-006",
    month_key: "2026-10",
    part_id: "SP-PNE-006",
    beginning_stock: 30,
    received_in_month: 15,
    daily_issues: { "day_3": 4, "day_8": 5, "day_14": 6, "day_19": 4 },
    total_issue: 19,
    current_stock: 26,
    notes: "Van tiết lưu SMC đầy đủ",
    last_updated: "2026-10-19T15:10:00Z"
  },
  "2026-10_SP-PNE-007": {
    id: "2026-10_SP-PNE-007",
    month_key: "2026-10",
    part_id: "SP-PNE-007",
    beginning_stock: 4,
    received_in_month: 0,
    daily_issues: { "day_11": 1, "day_20": 1 },
    total_issue: 2,
    current_stock: 2, // Alert <= 2
    notes: "Cần mua bổ sung cảm biến áp suất SMC",
    last_updated: "2026-10-20T16:00:00Z"
  },

  // --- 5. MRO ---
  "2026-10_SP-MRO-001": {
    id: "2026-10_SP-MRO-001",
    month_key: "2026-10",
    part_id: "SP-MRO-001",
    beginning_stock: 8,
    received_in_month: 4,
    daily_issues: { "day_1": 1, "day_8": 2, "day_15": 2, "day_21": 2 },
    total_issue: 7,
    current_stock: 5,
    notes: "Dầu máy may trắng châm định kỳ tuần",
    last_updated: "2026-10-21T09:40:00Z"
  },
  "2026-10_SP-MRO-002": {
    id: "2026-10_SP-MRO-002",
    month_key: "2026-10",
    part_id: "SP-MRO-002",
    beginning_stock: 5,
    received_in_month: 0,
    daily_issues: { "day_5": 1, "day_14": 1, "day_22": 1 },
    total_issue: 3,
    current_stock: 2, // Alert <= 3
    notes: "Mỡ Kluber tốc độ cao sắp hết",
    last_updated: "2026-10-22T14:15:00Z"
  },
  "2026-10_SP-MRO-003": {
    id: "2026-10_SP-MRO-003",
    month_key: "2026-10",
    part_id: "SP-MRO-003",
    beginning_stock: 24,
    received_in_month: 12,
    daily_issues: { "day_3": 3, "day_7": 4, "day_12": 5, "day_17": 4, "day_23": 3 },
    total_issue: 19,
    current_stock: 17,
    notes: "Chai xịt WD-40 phân bổ các tổ cơ điện",
    last_updated: "2026-10-23T10:00:00Z"
  },
  "2026-10_SP-MRO-004": {
    id: "2026-10_SP-MRO-004",
    month_key: "2026-10",
    part_id: "SP-MRO-004",
    beginning_stock: 8,
    received_in_month: 2,
    daily_issues: { "day_6": 1, "day_16": 2 },
    total_issue: 3,
    current_stock: 7,
    notes: "Keo khóa ren Loctite 243",
    last_updated: "2026-10-16T15:00:00Z"
  },
  "2026-10_SP-MRO-005": {
    id: "2026-10_SP-MRO-005",
    month_key: "2026-10",
    part_id: "SP-MRO-005",
    beginning_stock: 6,
    received_in_month: 0,
    daily_issues: { "day_9": 1, "day_18": 2 },
    total_issue: 3,
    current_stock: 3, // Alert <= 4
    notes: "Cấp mới cho thợ bảo trì xưởng may 2",
    last_updated: "2026-10-18T11:20:00Z"
  },
  "2026-10_SP-MRO-006": {
    id: "2026-10_SP-MRO-006",
    month_key: "2026-10",
    part_id: "SP-MRO-006",
    beginning_stock: 3,
    received_in_month: 1,
    daily_issues: { "day_14": 1 },
    total_issue: 1,
    current_stock: 3,
    notes: "Thước kẹp điện tử Mitutoyo phòng QA/QC",
    last_updated: "2026-10-14T14:30:00Z"
  },
  "2026-10_SP-MRO-007": {
    id: "2026-10_SP-MRO-007",
    month_key: "2026-10",
    part_id: "SP-MRO-007",
    beginning_stock: 12,
    received_in_month: 6,
    daily_issues: { "day_4": 2, "day_10": 3, "day_19": 3 },
    total_issue: 8,
    current_stock: 10,
    notes: "Súng xịt khí nén AirTAC",
    last_updated: "2026-10-19T16:45:00Z"
  },

  // --- 6. MESIN PRODUCSI ---
  "2026-10_SP-PRD-001": {
    id: "2026-10_SP-PRD-001",
    month_key: "2026-10",
    part_id: "SP-PRD-001",
    beginning_stock: 30,
    received_in_month: 15,
    daily_issues: { "day_5": 5, "day_12": 6, "day_20": 8 },
    total_issue: 19,
    current_stock: 26,
    notes: "Dán nối băng chuyền may số 4",
    last_updated: "2026-10-20T17:00:00Z"
  },
  "2026-10_SP-PRD-002": {
    id: "2026-10_SP-PRD-002",
    month_key: "2026-10",
    part_id: "SP-PRD-002",
    beginning_stock: 3,
    received_in_month: 0,
    daily_issues: { "day_11": 1 },
    total_issue: 1,
    current_stock: 2,
    notes: "Motor giảm tốc chuyền tải Tunglee",
    last_updated: "2026-10-11T13:30:00Z"
  },
  "2026-10_SP-PRD-003": {
    id: "2026-10_SP-PRD-003",
    month_key: "2026-10",
    part_id: "SP-PRD-003",
    beginning_stock: 18,
    received_in_month: 10,
    daily_issues: { "day_3": 2, "day_8": 4, "day_15": 4, "day_22": 3 },
    total_issue: 13,
    current_stock: 15,
    notes: "Vòng bi NSK 6204ZZ thay con lăn băng tải",
    last_updated: "2026-10-22T15:00:00Z"
  },
  "2026-10_SP-PRD-004": {
    id: "2026-10_SP-PRD-004",
    month_key: "2026-10",
    part_id: "SP-PRD-004",
    beginning_stock: 12,
    received_in_month: 5,
    daily_issues: { "day_6": 2, "day_16": 3, "day_23": 2 },
    total_issue: 7,
    current_stock: 10,
    notes: "Xích Tsubaki bước 40 chuyền may",
    last_updated: "2026-10-23T11:20:00Z"
  },
  "2026-10_SP-PRD-005": {
    id: "2026-10_SP-PRD-005",
    month_key: "2026-10",
    part_id: "SP-PRD-005",
    beginning_stock: 6,
    received_in_month: 0,
    daily_issues: { "day_9": 1, "day_17": 2 },
    total_issue: 3,
    current_stock: 3, // Alert <= 4
    notes: "Khớp nối nhôm đệm cao su máy chuyền",
    last_updated: "2026-10-17T16:15:00Z"
  },
  "2026-10_SP-PRD-006": {
    id: "2026-10_SP-PRD-006",
    month_key: "2026-10",
    part_id: "SP-PRD-006",
    beginning_stock: 15,
    received_in_month: 5,
    daily_issues: { "day_4": 3, "day_13": 4, "day_21": 3 },
    total_issue: 10,
    current_stock: 10,
    notes: "Phốt chặn dầu NOK chịu nhiệt",
    last_updated: "2026-10-21T14:40:00Z"
  },
  "2026-10_SP-PRD-007": {
    id: "2026-10_SP-PRD-007",
    month_key: "2026-10",
    part_id: "SP-PRD-007",
    beginning_stock: 4,
    received_in_month: 1,
    daily_issues: { "day_7": 1, "day_18": 1 },
    total_issue: 2,
    current_stock: 3,
    notes: "Cảm biến nhiệt độ PT100 máy ép mếch",
    last_updated: "2026-10-18T10:50:00Z"
  }
};

export const INITIAL_WORKSHOPS: WorkshopItem[] = [
  { id: "ws-a", name: "Xưởng A", code: "A", description: "Xưởng may & lắp ráp chuyền 1-10" },
  { id: "ws-b", name: "Xưởng B", code: "B", description: "Xưởng may máy chuyên dùng 11-20" },
  { id: "ws-c", name: "Xưởng C", code: "C", description: "Xưởng thêu & may mẫu tự động" },
  { id: "ws-d", name: "Xưởng D", code: "D", description: "Xưởng hoàn tất & đóng gói" },
  { id: "ws-e", name: "Xưởng E", code: "E", description: "Xưởng cơ điện & tiện bảo dưỡng" }
];

export const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  { id: "dept-co-dien", name: "Cơ điện", code: "CO_DIEN", description: "Bảo trì hệ thống cơ điện toàn xưởng" },
  { id: "dept-may-chuyen", name: "May chuyền", code: "MAY_CHUYEN", description: "Tổ kỹ thuật máy may dây chuyền" },
  { id: "dept-bao-tri", name: "Bảo trì máy May", code: "BAO_TRI_MAY", description: "Sửa chữa máy may công nghiệp" },
  { id: "dept-khi-nen", name: "Khí nén", code: "KHI_NEN", description: "Hệ thống khí nén & xilanh van hơi" },
  { id: "dept-dien-xuong", name: "Điện xưởng", code: "DIEN_XUONG", description: "Hệ thống điện động lực & biến tần" },
  { id: "dept-hoan-tat", name: "Hoàn tất", code: "HOAN_TAT", description: "Bảo trì máy ủi, máy ép mếch, bao gói" }
];

export const INITIAL_RECEIVERS: ReceiverItem[] = [
  { id: "rec-1", name: "Nguyễn Văn Tuấn", code: "TM-01", workshop: "Xưởng A", department: "Bảo trì máy May", note: "Thợ trưởng chuyền may 1-5", active: true },
  { id: "rec-2", name: "Trần Đình Khang", code: "TM-02", workshop: "Xưởng B", department: "Cơ điện", note: "Thợ điện động cơ & biến tần", active: true },
  { id: "rec-3", name: "Lê Hoàng Minh", code: "TM-03", workshop: "Xưởng C", department: "Khí nén", note: "Kỹ thuật khí nén & van hơi", active: true },
  { id: "rec-4", name: "Phạm Quốc Bảo", code: "TM-04", workshop: "Xưởng D", department: "May chuyền", note: "Thợ máy 1 kim & 2 kim", active: true },
  { id: "rec-5", name: "Đỗ Hữu Nghĩa", code: "TM-05", workshop: "Xưởng E", department: "Bảo trì máy May", note: "Chuyên máy tính máy đính bọ", active: true },
  { id: "rec-6", name: "Vũ Thanh Tùng", code: "TM-06", workshop: "Xưởng A", department: "Điện xưởng", note: "Bảo trì hệ thống nguồn & motor", active: true }
];

// Seed initial stock transactions and daily_receives based on INITIAL_MONTHLY_LOGS
export const INITIAL_TRANSACTIONS: StockTransaction[] = [];

Object.values(INITIAL_MONTHLY_LOGS).forEach((log, logIdx) => {
  const part = INITIAL_PARTS.find(p => p.id === log.part_id);
  const partName = part ? part.part_name : log.part_id;

  // Seed daily_receives if received_in_month > 0
  if (log.received_in_month > 0) {
    if (!log.daily_receives || Object.keys(log.daily_receives).length === 0) {
      log.daily_receives = {};
      if (log.received_in_month >= 4) {
        const half = Math.floor(log.received_in_month / 2);
        log.daily_receives['day_3'] = half;
        log.daily_receives['day_10'] = log.received_in_month - half;
      } else {
        log.daily_receives['day_5'] = log.received_in_month;
      }
    }

    // Generate IN transaction records
    Object.entries(log.daily_receives).forEach(([dayKey, qty]) => {
      const dayNum = parseInt(dayKey.replace('day_', ''), 10) || 5;
      INITIAL_TRANSACTIONS.push({
        id: `tx-in-${log.part_id}-${dayNum}`,
        type: 'IN',
        part_id: log.part_id,
        month_key: log.month_key || '2026-10',
        day: dayNum,
        date: `2026-10-${String(dayNum).padStart(2, '0')}`,
        quantity: qty,
        doc_no: `NK-2026-10-${String(dayNum).padStart(2, '0')}`,
        reason: 'Nhà cung cấp phụ tùng chính hãng Boyolali',
        notes: `Nhập bổ sung kho ${partName}`,
        created_at: `2026-10-${String(dayNum).padStart(2, '0')}T08:15:00Z`
      });
    });
  }

  // Generate OUT transaction records for each daily issue
  if (log.daily_issues) {
    Object.entries(log.daily_issues).forEach(([dayKey, qty], issueIdx) => {
      const dayNum = parseInt(dayKey.replace('day_', ''), 10);
      if (qty > 0 && dayNum >= 1 && dayNum <= 31) {
        const receiver = INITIAL_RECEIVERS[(logIdx + issueIdx + dayNum) % INITIAL_RECEIVERS.length];
        INITIAL_TRANSACTIONS.push({
          id: `tx-out-${log.part_id}-${dayNum}`,
          type: 'OUT',
          part_id: log.part_id,
          month_key: log.month_key || '2026-10',
          day: dayNum,
          date: `2026-10-${String(dayNum).padStart(2, '0')}`,
          quantity: qty,
          receiver_id: receiver.id,
          receiver_name: receiver.name,
          workshop: receiver.workshop,
          department: receiver.department,
          reason: `Thay thế phụ tùng máy ${part?.machine_code || 'may'} chuyền ${receiver.workshop.replace('Xưởng ', '')}`,
          doc_no: `PX-2026-10-${String(dayNum).padStart(2, '0')}`,
          notes: `Phiếu xuất kho ${partName}`,
          created_at: `2026-10-${String(dayNum).padStart(2, '0')}T14:30:00Z`
        });
      }
    });
  }
});

export const INITIAL_DATABASE: MroDatabase = {
  settings: INITIAL_SETTINGS,
  categories: INITIAL_CATEGORIES,
  locations: INITIAL_LOCATIONS,
  parts: INITIAL_PARTS,
  inventory_logs: INITIAL_MONTHLY_LOGS,
  receivers: INITIAL_RECEIVERS,
  workshops: INITIAL_WORKSHOPS,
  departments: INITIAL_DEPARTMENTS,
  transactions: INITIAL_TRANSACTIONS,
  version: 4,
  last_modified: new Date().toISOString()
};
