export type Language = 'vi' | 'id';

export interface Translations {
  // Brand & Header
  brandName: string;
  brandTagline: string;
  auditPeriod: string;
  stockLimitAlert: string;
  workstationsOnline: string;
  workstationsReady: string;
  syncNow: string;

  // Tabs
  tabModule1: string;
  tabModule2: string;
  tabModule3: string;

  // Filter Bar
  searchPlaceholder: string;
  filterAll: string;
  filterLimit: string;
  filterSafe: string;
  mainCategory: string;
  subCategory: string;
  machineCode: string;
  machineBrand: string;
  storageLocation: string;
  allMainCategories: string;
  allSubCategories: string;
  allMachines: string;
  allBrands: string;
  allLocations: string;
  clearFilters: string;

  // KPI Summary Cards
  kpiTotalCategories: string;
  kpiTotalItems: string;
  kpiTotalReceived: string;
  kpiTotalIssued: string;
  kpiStockLimitAlert: string;
  kpiPartsUnit: string;
  kpiItemsUnit: string;

  // Module 1 Title & Actions
  subHeaderTitle: string;
  btnStockOut: string;
  btnStockIn: string;
  btnToday: string;
  btnPrintSheet: string;

  // Table Column Headers (Sentence Case)
  colNo: string;
  colCategory: string;
  colPartNameLocation: string;
  colMachineBrand: string;
  colStatus: string;
  colRealtimeBalance: string;
  colBeginningStock: string;
  colReceived: string;
  colIssued: string;
  colEndingStock: string;
  colActiveBadge: string;
  colDailyLogTitleOut: string;
  colDailyLogTitleIn: string;
  colActions: string;

  // Table Values & Status
  statusLimit: string;
  statusSafe: string;
  unitLabel: string;
  minLimitLabel: string;
  totalSumLabel: string;
  noPartsFound: string;

  // Tooltip
  ttStockOutDay: string;
  ttStockInDay: string;
  ttRecipient: string;
  ttWorkshop: string;
  ttDepartment: string;
  ttReason: string;
  ttDocNo: string;
  ttTime: string;
  ttSupplier: string;

  // Module 2 Action Cards
  m2Title: string;
  m2Subtitle: string;
  cardStockInOutTitle: string;
  cardStockInOutDesc: string;
  cardAddNewPartTitle: string;
  cardAddNewPartDesc: string;

  // Stock In / Out Modal
  modalStockInOutTitle: string;
  selectTxType: string;
  btnTxOut: string;
  btnTxIn: string;
  partsListTitle: string;
  txDetailsTitle: string;
  txQuantityLabel: string;
  txDateLabel: string;
  txRecipientLabel: string;
  txDocNoLabel: string;
  txReasonLabel: string;
  txNotesLabel: string;
  btnSaveTx: string;
  btnCancel: string;

  // Two-step Confirmation
  confirmStep1Title: string;
  confirmStep1Desc: string;
  confirmStep1Prompt: string;
  confirmBtnContinue: string;
  confirmStep2Title: string;
  confirmStep2Desc: string;
  confirmStep2Prompt: string;
  confirmBtnFinal: string;
  confirmBtnBack: string;

  // Part Modal (+ Thêm Phụ Tùng Mới & Chỉnh Sửa)
  pmAddTitle: string;
  pmEditTitle: string;
  pmSubtitle: string;
  pmPhotoTitle: string;
  pmAutoCompress: string;
  pmUploadHover: string;
  pmSelectPhoto: string;
  pmDeletePhoto: string;
  pmPartName: string;
  pmPartNamePlaceholder: string;
  pmUnit: string;
  pmMinLimit: string;
  pmMinLimitDesc: string;
  pmMaxLimit: string;
  pmMaxLimitDesc: string;
  pmClassificationTitle: string;
  pmMainCat: string;
  pmSubUse: string;
  pmMachineCode: string;
  pmMachineBrand: string;
  pmLocation: string;
  pmQuickAdd: string;
  pmSelectMainCat: string;
  pmSelectSubUse: string;
  pmSelectMachineCode: string;
  pmSelectMachineBrand: string;
  pmSelectLocation: string;
  pmCustomFieldsTitle: string;
  pmCustomFieldsDesc: string;
  pmParamNamePlaceholder: string;
  pmParamValuePlaceholder: string;
  pmBtnAddParam: string;
  pmBtnCancel: string;
  pmBtnSave: string;
  pmBtnUpdate: string;

  // Print Modal
  printPreviewTitle: string;
  btnPrintNow: string;
  btnClose: string;
  printDocTitle: string;
  printAuditPeriod: string;
  printEffectiveDate: string;
  printAuditDate: string;
  printBoardOfSignatures: string;
  printFooterSystem: string;
  printPrintDate: string;
  printItemsCount: string;

  // Settings Module
  settingsTitle: string;
  tabReceivers: string;
  tabSignatures: string;
  tabFactory: string;
  tabCategories: string;
  tabLocations: string;
  tabBackup: string;

  // Actions
  actionEdit: string;
  actionDuplicate: string;
  actionDelete: string;
  confirmDeletePart: string;
}

export const translations: Record<Language, Translations> = {
  vi: {
    brandName: "JS CORPORATION",
    brandTagline: "MRO Smart stock system",
    auditPeriod: "Kiểm kê",
    stockLimitAlert: "STOCK LIMIT",
    workstationsOnline: "Máy trạm đồng bộ",
    workstationsReady: "Đa máy trạm sẵn sàng",
    syncNow: "Đồng bộ thủ công ngay",

    tabModule1: "Module 1: Báo Cáo Tổng Hợp",
    tabModule2: "Module 2: Quản Lý Phụ Tùng",
    tabModule3: "Module 3: Cài Đặt Hệ Thống",

    searchPlaceholder: "Tìm kiếm tức thì theo tên phụ tùng, mã máy (KM-250), vị trí kệ A-01-01...",
    filterAll: "Tất cả",
    filterLimit: "Stock Limit",
    filterSafe: "An toàn",
    mainCategory: "Sổ A: Danh mục chính",
    subCategory: "Sổ B: Loại sử dụng",
    machineCode: "Sổ C: Mã máy",
    machineBrand: "Hãng máy",
    storageLocation: "Vị trí: Khu Kệ",
    allMainCategories: "-- Tất cả ngành --",
    allSubCategories: "-- Tất cả loại dùng --",
    allMachines: "-- Tất cả mã máy --",
    allBrands: "-- Tất cả hãng máy --",
    allLocations: "-- Tất cả khu kệ --",
    clearFilters: "Xóa bộ lọc",

    kpiTotalCategories: "Tổng danh mục",
    kpiTotalItems: "phụ tùng",
    kpiTotalReceived: "Tổng nhập",
    kpiTotalIssued: "Tổng xuất",
    kpiStockLimitAlert: "Cảnh báo stock limit",
    kpiPartsUnit: "phụ tùng",
    kpiItemsUnit: "mặt hàng",

    subHeaderTitle: "Sổ nhập - xuất trong",
    btnStockOut: "Sổ Xuất",
    btnStockIn: "Sổ Nhập",
    btnToday: "Hôm nay",
    btnPrintSheet: "In Phiếu Kiểm Kê",

    // Table Column Headers (Sentence Case)
    colNo: "No.",
    colCategory: "Danh mục",
    colPartNameLocation: "Tên phụ tùng & vị trí",
    colMachineBrand: "Mã máy & hãng",
    colStatus: "Trạng thái",
    colRealtimeBalance: "Cân đối tồn kho thời gian thực",
    colBeginningStock: "Tồn đầu",
    colReceived: "Nhập",
    colIssued: "Xuất",
    colEndingStock: "Tồn cuối",
    colActiveBadge: "BẬT",
    colDailyLogTitleOut: "Sổ theo dõi xuất 31 ngày trong tháng",
    colDailyLogTitleIn: "Sổ theo dõi nhập 31 ngày trong tháng",
    colActions: "Thao tác",

    statusLimit: "LIMIT",
    statusSafe: "AMAN",
    unitLabel: "ĐVT",
    minLimitLabel: "Min",
    totalSumLabel: "Tổng cộng",
    noPartsFound: "Không tìm thấy phụ tùng nào phù hợp với bộ lọc hiện tại.",

    ttStockOutDay: "Xuất kho",
    ttStockInDay: "Nhập kho",
    ttRecipient: "Người nhận",
    ttWorkshop: "Xưởng",
    ttDepartment: "Bộ phận",
    ttReason: "Lý do / Máy",
    ttDocNo: "Chứng từ",
    ttTime: "Thời gian",
    ttSupplier: "Đơn vị giao",

    m2Title: "Module 2: Quản Lý Phụ Tùng",
    m2Subtitle: "Hệ thống thao tác nghiệp vụ kho nhanh chóng và thêm mới phụ tùng chuẩn hóa",
    cardStockInOutTitle: "Xuất - Nhập Phụ Tùng",
    cardStockInOutDesc: "Thực hiện giao dịch xuất kho cho thợ máy hoặc nhập kho phụ tùng với xác thực 2 bước an toàn",
    cardAddNewPartTitle: "+ Thêm Phụ Tùng Mới",
    cardAddNewPartDesc: "Đăng ký phụ tùng mới, phân loại ngành hàng, gán vị trí kệ và mức tồn tối thiểu",

    modalStockInOutTitle: "Xuất - Nhập Phụ Tùng",
    selectTxType: "Chọn loại giao dịch",
    btnTxOut: "Xuất kho",
    btnTxIn: "Nhập kho",
    partsListTitle: "Danh sách phụ tùng",
    txDetailsTitle: "Thông tin giao dịch",
    txQuantityLabel: "Số lượng thực hiện",
    txDateLabel: "Ngày ghi sổ",
    txRecipientLabel: "Người thợ máy nhận hàng",
    txDocNoLabel: "Mã chứng từ / Phiếu",
    txReasonLabel: "Lý do / Máy sử dụng",
    txNotesLabel: "Ghi chú",
    btnSaveTx: "Lưu giao dịch Xuất/Nhập",
    btnCancel: "Hủy bỏ",

    confirmStep1Title: "Xác nhận giao dịch (Bước 1 / 2)",
    confirmStep1Desc: "Vui lòng kiểm tra lại toàn bộ thông tin xuất/nhập trước khi lưu.",
    confirmStep1Prompt: "Bạn có chắc chắn các thông tin trên là chính xác và muốn chuyển sang bước xác nhận cuối cùng?",
    confirmBtnContinue: "Tiếp tục (Bước 2/2)",
    confirmStep2Title: "Cảnh báo xác nhận lần 2 (Bước 2 / 2)",
    confirmStep2Desc: "Xác nhận lần cuối trước khi cập nhật dữ liệu tồn kho toàn hệ thống.",
    confirmStep2Prompt: "Bạn có HOÀN TOÀN CHẮC CHẮN muốn lưu dữ liệu này?",
    confirmBtnFinal: "Xác nhận lưu dữ liệu ngay",
    confirmBtnBack: "Quay lại bước 1",

    pmAddTitle: "Thêm Mới Phụ Tùng MRO",
    pmEditTitle: "Chỉnh Sửa Thông Tin Phụ Tùng MRO",
    pmSubtitle: "Quản lý master data chuẩn nhà máy JS Corp Boyolali",
    pmPhotoTitle: "Ảnh phụ tùng (150x150 1:1)",
    pmAutoCompress: "Tự động nén < 20KB",
    pmUploadHover: "Tải ảnh lên",
    pmSelectPhoto: "Chọn ảnh",
    pmDeletePhoto: "Xóa ảnh",
    pmPartName: "Tên phụ tùng",
    pmPartNamePlaceholder: "VD: Rotary Hook Hirose HSH-7.94BTR (Ổ chao máy may)",
    pmUnit: "Đơn vị tính",
    pmMinLimit: "Tồn tối thiểu (Stock Limit)",
    pmMinLimitDesc: "Cảnh báo đỏ khi UNITE ≤ mức này",
    pmMaxLimit: "Tồn tối đa (Max Limit)",
    pmMaxLimitDesc: "Mức tồn tối ưu kho",
    pmClassificationTitle: "Phân loại & cây danh mục",
    pmMainCat: "Sổ A: Danh mục chính",
    pmSubUse: "Sổ B: Loại sử dụng",
    pmMachineCode: "Mã máy",
    pmMachineBrand: "Hãng máy",
    pmLocation: "Vị trí kệ kho (G-K-B Barcode)",
    pmQuickAdd: "Thêm nhanh",
    pmSelectMainCat: "-- Chọn ngành / danh mục --",
    pmSelectSubUse: "-- Chọn loại sử dụng --",
    pmSelectMachineCode: "-- Chọn mã máy --",
    pmSelectMachineBrand: "-- Chọn thương hiệu máy --",
    pmSelectLocation: "-- Chọn vị trí kệ --",
    pmCustomFieldsTitle: "Thuộc tính tùy biến (Custom Fields)",
    pmCustomFieldsDesc: "Lưu trữ linh hoạt: ren ốc, điện áp, cự ly may, kích thước kim...",
    pmParamNamePlaceholder: "Tên thông số (VD: Điện áp, Ren)",
    pmParamValuePlaceholder: "Giá trị (VD: 24VDC, M5)",
    pmBtnAddParam: "+ Thêm",
    pmBtnCancel: "Hủy bỏ",
    pmBtnSave: "Lưu mới phụ tùng",
    pmBtnUpdate: "Cập nhật phụ tùng",

    printPreviewTitle: "Xem trước phiếu kiểm kê (Landscape)",
    btnPrintNow: "In phiếu ngay",
    btnClose: "Đóng",
    printDocTitle: "BÁO CÁO KIỂM SOÁT TỒN KHO MRO",
    printAuditPeriod: "Kỳ kiểm kê",
    printEffectiveDate: "Ngày cơ sở",
    printAuditDate: "Ngày kiểm kê",
    printBoardOfSignatures: "LEMBAR PENGESAHAN (BAN KÝ DUYỆT KIỂM KÊ KHO):",
    printFooterSystem: "In từ Hệ thống Quản lý MRO Thông Minh - JS Corporation Boyolali",
    printPrintDate: "Ngày in",
    printItemsCount: "mục",

    settingsTitle: "Module 3: Cài Đặt Hệ Thống",
    tabReceivers: "Người nhận hàng",
    tabSignatures: "Ban ký duyệt",
    tabFactory: "Thông tin nhà máy",
    tabCategories: "Danh mục kỹ thuật",
    tabLocations: "Vị trí kệ",
    tabBackup: "Sao lưu & Phục hồi",

    actionEdit: "Chỉnh sửa",
    actionDuplicate: "Nhân bản",
    actionDelete: "Xóa",
    confirmDeletePart: "Bạn có chắc chắn muốn xóa phụ tùng này không?"
  },
  id: {
    brandName: "JS CORPORATION",
    brandTagline: "MRO Smart stock system",
    auditPeriod: "Periode SO",
    stockLimitAlert: "BATAS KRITIS",
    workstationsOnline: "Workstation Sinkron",
    workstationsReady: "Multi-Workstation Siap",
    syncNow: "Sinkronisasi Manual",

    tabModule1: "Module 1: Laporan Rekapitulasi",
    tabModule2: "Module 2: Manajemen Suku Cadang",
    tabModule3: "Module 3: Pengaturan Sistem",

    searchPlaceholder: "Pencarian cepat berdasarkan nama suku cadang, kode mesin (KM-250), lokasi rak A-01-01...",
    filterAll: "Semua",
    filterLimit: "Batas Kritis",
    filterSafe: "Aman",
    mainCategory: "Kategori Utama (A)",
    subCategory: "Jenis Penggunaan (B)",
    machineCode: "Kode Mesin (C)",
    machineBrand: "Merek Mesin",
    storageLocation: "Lokasi: Rak Gudang",
    allMainCategories: "-- Semua Kategori --",
    allSubCategories: "-- Semua Jenis --",
    allMachines: "-- Semua Mesin --",
    allBrands: "-- Semua Merek --",
    allLocations: "-- Semua Rak --",
    clearFilters: "Hapus Filter",

    kpiTotalCategories: "Total suku cadang",
    kpiTotalItems: "item",
    kpiTotalReceived: "Total masuk",
    kpiTotalIssued: "Total keluar",
    kpiStockLimitAlert: "Peringatan batas kritis",
    kpiPartsUnit: "item",
    kpiItemsUnit: "item",

    subHeaderTitle: "Catatan masuk - keluar bulanan",
    btnStockOut: "Catatan Keluar",
    btnStockIn: "Catatan Masuk",
    btnToday: "Hari Ini",
    btnPrintSheet: "Cetak Lembar SO",

    // Table Column Headers (Sentence Case)
    colNo: "No.",
    colCategory: "Kategori",
    colPartNameLocation: "Nama suku cadang & lokasi",
    colMachineBrand: "Kode mesin & merek",
    colStatus: "Status",
    colRealtimeBalance: "Saldo stok real-time",
    colBeginningStock: "Stok awal",
    colReceived: "Masuk",
    colIssued: "Keluar",
    colEndingStock: "Stok akhir",
    colActiveBadge: "AKTIF",
    colDailyLogTitleOut: "Catatan pengeluaran 31 hari dalam bulan",
    colDailyLogTitleIn: "Catatan penerimaan 31 hari dalam bulan",
    colActions: "Aksi",

    statusLimit: "LIMIT",
    statusSafe: "AMAN",
    unitLabel: "Satuan",
    minLimitLabel: "Min",
    totalSumLabel: "Total rekap",
    noPartsFound: "Tidak ada suku cadang yang sesuai dengan filter saat ini.",

    ttStockOutDay: "Pengeluaran",
    ttStockInDay: "Penerimaan",
    ttRecipient: "Penerima",
    ttWorkshop: "Pabrik / Gedung",
    ttDepartment: "Departemen",
    ttReason: "Alasan / Mesin",
    ttDocNo: "No. Bukti",
    ttTime: "Waktu",
    ttSupplier: "Pemasok / Pengirim",

    m2Title: "Module 2: Manajemen Suku Cadang",
    m2Subtitle: "Pusat operasi transaksi suku cadang cepat dan pendaftaran master data baru",
    cardStockInOutTitle: "Keluar - Masuk Suku Cadang",
    cardStockInOutDesc: "Lakukan transaksi pengeluaran untuk teknisi atau penerimaan barang dengan konfirmasi 2 tahap aman",
    cardAddNewPartTitle: "+ Tambah Suku Cadang Baru",
    cardAddNewPartDesc: "Daftarkan suku cadang baru, klasifikasi kategori, tentukan lokasi rak dan batas stok minimum",

    modalStockInOutTitle: "Keluar - Masuk Suku Cadang",
    selectTxType: "Pilih jenis transaksi",
    btnTxOut: "Suku cadang keluar",
    btnTxIn: "Suku cadang masuk",
    partsListTitle: "Daftar suku cadang",
    txDetailsTitle: "Rincian transaksi",
    txQuantityLabel: "Jumlah transaksi",
    txDateLabel: "Tanggal pencatatan",
    txRecipientLabel: "Teknisi penerima barang",
    txDocNoLabel: "Nomor dokumen / Surat jalan",
    txReasonLabel: "Alasan / Mesin pengguna",
    txNotesLabel: "Catatan tambahan",
    btnSaveTx: "Simpan Transaksi Masuk/Keluar",
    btnCancel: "Batal",

    confirmStep1Title: "Konfirmasi Transaksi (Tahap 1 / 2)",
    confirmStep1Desc: "Harap periksa kembali semua rincian masuk/keluar sebelum menyimpan.",
    confirmStep1Prompt: "Apakah Anda yakin data di atas sudah benar dan ingin lanjut ke tahap konfirmasi akhir?",
    confirmBtnContinue: "Lanjut (Tahap 2/2)",
    confirmStep2Title: "Peringatan Konfirmasi Tahap 2 (Tahap 2 / 2)",
    confirmStep2Desc: "Konfirmasi terakhir sebelum memperbarui stok gudang di seluruh sistem.",
    confirmStep2Prompt: "Apakah Anda BENAR-BENAR YAKIN ingin menyimpan transaksi ini?",
    confirmBtnFinal: "Konfirmasi Simpan Transaksi Sekarang",
    confirmBtnBack: "Kembali ke tahap 1",

    pmAddTitle: "Tambah Suku Cadang MRO Baru",
    pmEditTitle: "Ubah Informasi Suku Cadang MRO",
    pmSubtitle: "Kelola master data standar pabrik JS Corp Boyolali",
    pmPhotoTitle: "Foto suku cadang (150x150 1:1)",
    pmAutoCompress: "Kompres otomatis < 20KB",
    pmUploadHover: "Unggah foto",
    pmSelectPhoto: "Pilih foto",
    pmDeletePhoto: "Hapus foto",
    pmPartName: "Nama suku cadang",
    pmPartNamePlaceholder: "Cth: Rotary Hook Hirose HSH-7.94BTR",
    pmUnit: "Satuan (Unit)",
    pmMinLimit: "Batas stok minimum (Stock Limit)",
    pmMinLimitDesc: "Peringatan merah saat STOK AKHIR ≤ batas ini",
    pmMaxLimit: "Batas stok maksimum (Max Limit)",
    pmMaxLimitDesc: "Tingkat stok optimal gudang",
    pmClassificationTitle: "Klasifikasi & pohon kategori",
    pmMainCat: "Kategori utama (A)",
    pmSubUse: "Jenis penggunaan (B)",
    pmMachineCode: "Kode mesin (C)",
    pmMachineBrand: "Merek mesin",
    pmLocation: "Lokasi rak gudang (G-K-B Barcode)",
    pmQuickAdd: "Tambah cepat",
    pmSelectMainCat: "-- Pilih kategori utama --",
    pmSelectSubUse: "-- Pilih jenis penggunaan --",
    pmSelectMachineCode: "-- Pilih kode mesin --",
    pmSelectMachineBrand: "-- Pilih merek mesin --",
    pmSelectLocation: "-- Pilih lokasi rak --",
    pmCustomFieldsTitle: "Atribut kustom (Custom Fields)",
    pmCustomFieldsDesc: "Simpan fleksibel: ulir baut, voltase, jarak jahitan, ukuran jarum...",
    pmParamNamePlaceholder: "Nama parameter (cth: Voltase, Ulir)",
    pmParamValuePlaceholder: "Nilai (cth: 24VDC, M5)",
    pmBtnAddParam: "+ Tambah",
    pmBtnCancel: "Batal",
    pmBtnSave: "Simpan suku cadang",
    pmBtnUpdate: "Perbarui suku cadang",

    printPreviewTitle: "Pratinjau lembar SO (Landscape)",
    btnPrintNow: "Cetak sekarang",
    btnClose: "Tutup",
    printDocTitle: "LAPORAN PENGENDALIAN STOK MRO",
    printAuditPeriod: "Periode SO",
    printEffectiveDate: "Tanggal dasar",
    printAuditDate: "Tanggal SO",
    printBoardOfSignatures: "LEMBAR PENGESAHAN (DEWAN PENGESAHAN SO GUDANG):",
    printFooterSystem: "Dicetak dari Sistem Manajemen MRO Pintar - JS Corporation Boyolali",
    printPrintDate: "Tanggal cetak",
    printItemsCount: "item",

    settingsTitle: "Module 3: Pengaturan Sistem",
    tabReceivers: "Penerima barang",
    tabSignatures: "Dewan pengesahan",
    tabFactory: "Profil pabrik",
    tabCategories: "Kategori teknis",
    tabLocations: "Lokasi rak",
    tabBackup: "Cadangkan & Pulihkan",

    actionEdit: "Ubah",
    actionDuplicate: "Duplikat",
    actionDelete: "Hapus",
    confirmDeletePart: "Apakah Anda yakin ingin menghapus suku cadang ini?"
  }
};
