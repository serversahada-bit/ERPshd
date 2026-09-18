export interface ERPMenuItem {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  href?: string;
}

export interface ERPSubModule {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  items: ERPMenuItem[];
}

export interface ERPModule {
  id: string;
  title: string;
  category: 'core' | 'operasional' | 'finansial' | 'dukungan';
  icon: string;
  badge?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  description: string;
  color: string;
  submodules: ERPSubModule[];
  quickStats?: {
    label: string;
    value: string;
    trend: string;
  }[];
}

export const ERP_MENU_CATEGORIES = [
  { id: 'core', label: 'UTAMA' },
  { id: 'operasional', label: 'OPERASIONAL BISNIS' },
  { id: 'finansial', label: 'FINANSIAL & KEUANGAN' },
  { id: 'dukungan', label: 'SUMBER DAYA & SISTEM' },
] as const;

export const ERP_MODULES: ERPModule[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Eksekutif',
    category: 'core',
    icon: 'LayoutDashboard',
    badge: 'Real-time',
    badgeType: 'success',
    color: 'from-blue-600 to-indigo-700',
    description: 'Pusat pantauan KPI bisnis terintegrasi, real-time analytics, dan ringkasan eksekutif seluruh unit usaha.',
    quickStats: [
      { label: 'Total Revenue (MTD)', value: 'Rp 4.82 M', trend: '+12.4% vs bln lalu' },
      { label: 'Work Order Aktif', value: '38 Unit', trend: '94% On Schedule' },
      { label: 'Pending Approval', value: '14 Berkas', trend: 'Perlu verifikasi' }
    ],
    submodules: [
      {
        id: 'dash-analytics',
        title: 'Ringkasan & Analitik',
        items: [
          { id: 'kpi-overview', title: 'Ringkasan KPI Perusahaan', description: 'Metrik utama pendapatan, laba bersih, & efisiensi' },
          { id: 'sales-analytics', title: 'Analisis Tren Penjualan', description: 'Performa per wilayah & kategori produk' },
          { id: 'cashflow-monitor', title: 'Arus Kas Realtime', description: 'Monitor likuiditas & posisi saldo bank harian' },
          { id: 'ops-efficiency', title: 'Efisiensi Operasional (OEE)', description: 'Metrik pemanfaatan kapasitas pabrik & mesin' }
        ]
      },
      {
        id: 'dash-approvals',
        title: 'Pusat Persetujuan',
        badge: '5 Menunggu',
        items: [
          { id: 'po-approvals', title: 'Approval Purchase Order', badge: '3 PO', badgeType: 'warning' },
          { id: 'payment-approvals', title: 'Approval Pengeluaran Kas/Bank', badge: '2 Draft', badgeType: 'danger' },
          { id: 'leave-approvals', title: 'Approval Pengajuan Cuti & Lembur' }
        ]
      }
    ]
  },
  {
    id: 'manufacturing',
    title: 'Manufaktur & Produksi',
    category: 'operasional',
    icon: 'Factory',
    badge: '18 SPK',
    badgeType: 'primary',
    color: 'from-amber-600 to-orange-700',
    description: 'Manajemen alur proses produksi dari formulasi BOM, SPK, jadwal stasiun kerja, hingga kontrol kualitas (QC).',
    quickStats: [
      { label: 'Work Order Berjalan', value: '18 SPK', trend: '3 Dalam finishing' },
      { label: 'OEE Line Pabrik', value: '87.5%', trend: 'Target: 85%' },
      { label: 'Rasio Scrap/Cacat', value: '0.8%', trend: '-0.3% bulan ini' }
    ],
    submodules: [
      {
        id: 'mfg-planning',
        title: 'Perencanaan & Formula',
        items: [
          { id: 'bom', title: 'Bill of Materials (BOM)', description: 'Struktur resep, komponen, & overhead produk', badge: 'Standar' },
          { id: 'work-centers', title: 'Pusat Kerja & Mesin (Work Centers)', description: 'Kapasitas lini, tarif jam mesin & tenaga kerja' },
          { id: 'routing', title: 'Rute & Operasi Produksi', description: 'Urutan tahapan fabrikasi, perakitan, dan inspeksi' },
          { id: 'mps', title: 'Jadwal Induk Produksi (MPS)', description: 'Master production schedule & peramalan kapasitas' }
        ]
      },
      {
        id: 'mfg-execution',
        title: 'Pelaksanaan & Pelaporan SPK',
        items: [
          { id: 'work-orders', title: 'Perintah Kerja (Work Order / SPK)', badge: '18 Aktif', badgeType: 'primary' },
          { id: 'job-costing', title: 'Kalkulasi HPP Pabrikasi', description: 'Perhitungan actual vs standard cost' },
          { id: 'subcontract', title: 'Maklon / Subkontrak Luar', description: 'Monitoring pekerjaan yang dialihdayakan' }
        ]
      },
      {
        id: 'mfg-quality',
        title: 'Quality & Maintenance',
        items: [
          { id: 'qc-inspection', title: 'Inspeksi Mutu (QC)', badge: 'Inspeksi', badgeType: 'warning' },
          { id: 'machine-maintenance', title: 'Preventive Maintenance Mesin', description: 'Jadwal servis berkala & kalibrasi sensor' }
        ]
      }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory & Gudang',
    category: 'operasional',
    icon: 'Boxes',
    badge: '3 Alert',
    badgeType: 'danger',
    color: 'from-emerald-600 to-teal-700',
    description: 'Manajemen persediaan multi-gudang, penomoran batch/lot & serial, mutasi antar cabang, dan stok opname.',
    quickStats: [
      { label: 'Total Valuasi Stok', value: 'Rp 14.2 M', trend: '12,450 SKU Aktif' },
      { label: 'Barang Stok Rendah', value: '8 SKU', trend: 'Butuh reorder segera' },
      { label: 'Akurasi Opname', value: '99.4%', trend: 'Audit Q3 Lulus' }
    ],
    submodules: [
      {
        id: 'inv-master',
        title: 'Master & Katalog Barang',
        items: [
          { id: 'item-master', title: 'Katalog Master Produk & SKU', description: 'Data bahan baku, barang setengah jadi, & barang jadi' },
          { id: 'categories-uom', title: 'Kategori Produk & Satuan (UoM)', description: 'Konversi satuan (Pcs, Box, Pallet, Roll)' },
          { id: 'price-lists', title: 'Daftar Harga Beli & Jual', description: 'Tiering harga grosir, retail, dan proyek' }
        ]
      },
      {
        id: 'inv-operations',
        title: 'Pergerakan & Logistik Stok',
        items: [
          { id: 'stock-transfer', title: 'Mutasi / Transfer Antar Gudang', badge: '4 Pending', badgeType: 'primary' },
          { id: 'stock-adjustment', title: 'Penyesuaian & Koreksi Stok', description: 'Pencatatan selisih dan barang rusak/afkir' },
          { id: 'stock-opname', title: 'Stok Opname (Stock Counting)', description: 'Penghitungan fisik terjadwal dengan scanner QR' },
          { id: 'batch-tracking', title: 'Pelacakan Lot / Batch & Expired', badge: 'FEFO/FIFO' }
        ]
      },
      {
        id: 'inv-reports',
        title: 'Laporan & Audit Gudang',
        items: [
          { id: 'stock-card', title: 'Kartu Stok & Buku Mutasi', description: 'Histori keluar-masuk barang per gudang' },
          { id: 'stock-aging', title: 'Analisis Usia Barang (Slow/Dead Stock)' },
          { id: 'safety-stock-alert', title: 'Peringatan Stok Minimum', badge: '3 Kritis', badgeType: 'danger' }
        ]
      }
    ]
  },
  {
    id: 'sales',
    title: 'Penjualan & CRM',
    category: 'operasional',
    icon: 'TrendingUp',
    badge: 'Rp 1.4M Target',
    badgeType: 'success',
    color: 'from-blue-500 to-cyan-600',
    description: 'Siklus lengkap dari prospek prospektif (Leads), penawaran quotation, Sales Order (SO), hingga surat jalan.',
    quickStats: [
      { label: 'Pencapaian Target', value: '92.8%', trend: 'Rp 1.4 M dari Rp 1.5 M' },
      { label: 'SO Siap Kirim', value: '23 Order', trend: 'Packing & Scheduling' },
      { label: 'Pipeline Prospek', value: '45 Leads', trend: 'Nilai potensi: Rp 3.2 M' }
    ],
    submodules: [
      {
        id: 'crm-pipeline',
        title: 'Manajemen Prospek & Pelanggan',
        items: [
          { id: 'customer-data', title: 'Database Pelanggan & Akun', description: 'Histori transaksi, limit kredit, dan kontak PIC' },
          { id: 'leads-pipeline', title: 'Pipeline Leads & Opportunity', badge: 'Kanban CRM' },
          { id: 'sales-territory', title: 'Wilayah & Rute Salesman', description: 'Alokasi target per area geografis' }
        ]
      },
      {
        id: 'sales-transactions',
        title: 'Transaksi Penjualan',
        items: [
          { id: 'quotations', title: 'Surat Penawaran Harga (Quotation)', badge: '6 Aktif' },
          { id: 'sales-orders', title: 'Sales Order (SO)', badge: '23 Menunggu Kirim', badgeType: 'primary' },
          { id: 'delivery-orders', title: 'Surat Jalan (Delivery Order)', description: 'Dokumen ekspedisi & verifikasi tanda terima' },
          { id: 'sales-invoices', title: 'Faktur Penjualan (Sales Invoice)', description: 'Penerbitan tagihan resmi ke konsumen' },
          { id: 'sales-returns', title: 'Retur Penjualan (Credit Memo)', description: 'Penanganan komplain & pengembalian produk' }
        ]
      },
      {
        id: 'sales-reports',
        title: 'Komisi & Performa',
        items: [
          { id: 'sales-commission', title: 'Perhitungan Komisi Salesman' },
          { id: 'customer-aging-report', title: 'Laporan Umur Piutang per Pelanggan' }
        ]
      }
    ]
  },
  {
    id: 'procurement',
    title: 'Pembelian (Procurement)',
    category: 'operasional',
    icon: 'ShoppingCart',
    badge: '7 PO Baru',
    badgeType: 'warning',
    color: 'from-violet-600 to-purple-800',
    description: 'Alur pengadaan bahan baku dan aset: Permintaan Beli (PR), RFQ multi-vendor, Purchase Order (PO), hingga Penerimaan (GRN).',
    quickStats: [
      { label: 'PO Bulan Berjalan', value: 'Rp 2.1 M', trend: '48 Purchase Orders' },
      { label: 'Menunggu Penerimaan', value: '9 Pengiriman', trend: 'ETA 1-3 hari' },
      { label: 'Vendor Aktif', value: '64 Rekanan', trend: 'Rating rata-rata 4.7/5' }
    ],
    submodules: [
      {
        id: 'proc-master',
        title: 'Master Vendor & Kontrak',
        items: [
          { id: 'vendor-list', title: 'Direktori Vendor & Supplier', description: 'Legalitas, profil bank, & termin pembayaran' },
          { id: 'price-comparison', title: 'Banding Harga Penawaran Vendor' },
          { id: 'vendor-contracts', title: 'Kontrak Pembelian Payung (Blanket PO)' }
        ]
      },
      {
        id: 'proc-transactions',
        title: 'Alur Pengadaan Barang',
        items: [
          { id: 'purchase-requisition', title: 'Permintaan Pembelian (PR)', badge: '5 Menunggu Acc', badgeType: 'warning' },
          { id: 'rfq-quotations', title: 'Permintaan Penawaran (RFQ)', description: 'Tender penawaran ke 3 vendor sekaligus' },
          { id: 'purchase-orders', title: 'Surat Pesanan (Purchase Order / PO)', badge: '7 Baru', badgeType: 'primary' },
          { id: 'goods-receipt', title: 'Penerimaan Barang (GRN / LPB)', description: 'Pemeriksaan fisik barang tiba di gudang' },
          { id: 'vendor-bills', title: 'Verifikasi Faktur Tagihan Vendor (Bill)' },
          { id: 'purchase-returns', title: 'Retur Pembelian (Debit Memo)' }
        ]
      }
    ]
  },
  {
    id: 'finance',
    title: 'Keuangan & Akuntansi',
    category: 'finansial',
    icon: 'Landmark',
    badge: 'Closing Q3',
    badgeType: 'purple',
    color: 'from-slate-800 to-zinc-900',
    description: 'Sistem akuntansi double-entry standar PSAK: Chart of Accounts, Jurnal Umum, Kas & Bank, AP/AR, Rekonsiliasi, dan Laporan Pajak.',
    quickStats: [
      { label: 'Kas & Setara Kas', value: 'Rp 6.18 M', trend: '7 Akun Bank Terhubung' },
      { label: 'Total Piutang (AR)', value: 'Rp 3.45 M', trend: 'Rp 280 Jt Jatuh Tempo' },
      { label: 'Total Hutang (AP)', value: 'Rp 1.95 M', trend: 'Jadwal bayar minggu ini' }
    ],
    submodules: [
      {
        id: 'fin-gl',
        title: 'Buku Besar & Bagan Akun',
        items: [
          { id: 'coa', title: 'Bagan Akun (Chart of Accounts / COA)', description: 'Struktur kode akun aktiva, pasiva, modal, pendapatan, beban' },
          { id: 'journal-entry', title: 'Jurnal Umum (Manual Journal)', badge: 'Double Entry' },
          { id: 'general-ledger', title: 'Buku Besar & Neraca Saldo (Trial Balance)' },
          { id: 'period-closing', title: 'Tutup Buku Bulanan & Tahunan', description: 'Proses closing otomatis dan jurnal pembalik' }
        ]
      },
      {
        id: 'fin-cash-bank',
        title: 'Kas, Bank & Pembayaran',
        items: [
          { id: 'bank-accounts', title: 'Master Rekening Kas & Bank' },
          { id: 'bank-reconciliation', title: 'Rekonsiliasi Bank Otomatis', badge: 'Auto Match' },
          { id: 'petty-cash', title: 'Kas Kecil (Petty Cash Imprest)', description: 'Klaim reimbursment operasional kantor' },
          { id: 'accounts-receivable', title: 'Piutang Usaha (AR Monitoring)', badge: 'Invoice Aging' },
          { id: 'accounts-payable', title: 'Hutang Usaha (AP Schedule)', badge: 'Payment Batch' }
        ]
      },
      {
        id: 'fin-tax-reports',
        title: 'Laporan Keuangan & Pajak',
        items: [
          { id: 'profit-loss', title: 'Laporan Laba Rugi (P&L Statement)', description: 'Multi-cabang & komparasi tahunan' },
          { id: 'balance-sheet', title: 'Neraca Keuangan (Balance Sheet)' },
          { id: 'cashflow-statement', title: 'Laporan Arus Kas (Langsung & Tidak Langsung)' },
          { id: 'tax-efaktur', title: 'Modul Pajak (e-Faktur PPN & PPh 21/23)', badge: 'DJP Ready' }
        ]
      }
    ]
  },
  {
    id: 'hr',
    title: 'SDM, HR & Payroll',
    category: 'dukungan',
    icon: 'Users',
    badge: '142 Pegawai',
    badgeType: 'primary',
    color: 'from-rose-600 to-pink-700',
    description: 'Manajemen kepegawaian menyeluruh: data induk karyawan, mesin fingerprint/presensi GPS, lembur, izin cuti, serta kalkulasi gaji & BPJS.',
    quickStats: [
      { label: 'Karyawan Aktif', value: '142 Orang', trend: '98% Hadir Hari Ini' },
      { label: 'Estimasi Payroll', value: 'Rp 890 Jt', trend: 'Periode cut-off 25' },
      { label: 'Pengajuan Cuti', value: '4 Pengajuan', trend: 'Butuh review atasan' }
    ],
    submodules: [
      {
        id: 'hr-personnel',
        title: 'Personalia & Organisasi',
        items: [
          { id: 'employee-directory', title: 'Database Karyawan & Kontrak', description: 'PKWT, PKWTT, data keluarga, & dokumen identitas' },
          { id: 'organization-chart', title: 'Struktur Organisasi & Jabatan', description: 'Hirarki departemen dan wewenang persetujuan' },
          { id: 'announcements', title: 'Pengumuman & Surat Edaran Internal' }
        ]
      },
      {
        id: 'hr-time-attendance',
        title: 'Presensi & Waktu Kerja',
        items: [
          { id: 'attendance-logs', title: 'Catatan Absensi & Shift Kerja', badge: 'Sync Mesin', badgeType: 'success' },
          { id: 'leave-requests', title: 'Pengajuan Cuti, Sakit & Izin', badge: '4 Menunggu' },
          { id: 'overtime-slips', title: 'Surat Perintah Lembur (SPL)' }
        ]
      },
      {
        id: 'hr-payroll',
        title: 'Payroll & Tunjangan',
        items: [
          { id: 'salary-computation', title: 'Proses Penggajian (Payroll Engine)', description: 'Otomasi PPh 21 TER, BPJS Kesehatan & Ketenagakerjaan' },
          { id: 'payslips', title: 'Distribusi Slip Gaji Digital', description: 'Enkripsi password dan kirim via email/WhatsApp' },
          { id: 'thr-bonus', title: 'Kalkulator THR & Bonus Tahunan' }
        ]
      }
    ]
  },
  {
    id: 'settings',
    title: 'Pengaturan & Keamanan',
    category: 'dukungan',
    icon: 'Sliders',
    color: 'from-gray-700 to-gray-900',
    description: 'Pusat konfigurasi tata kelola enterprise: hak akses berbasis peran (RBAC), multi-perusahaan/cabang, audit trail, dan API integrasi.',
    quickStats: [
      { label: 'Entitas Cabang', value: '4 Cabang', trend: 'Jakarta, Sby, Mdn, Bdg' },
      { label: 'Total User Sistem', value: '32 Akun', trend: '6 Role Hak Akses' },
      { label: 'Log Aktivitas', value: '1,240 Hari Ini', trend: 'Security Health OK' }
    ],
    submodules: [
      {
        id: 'sys-organization',
        title: 'Entitas & Lokasi',
        items: [
          { id: 'company-profile', title: 'Profil Perusahaan & Legalitas' },
          { id: 'branches-units', title: 'Manajemen Multi-Cabang & Unit Usaha' },
          { id: 'fiscal-years', title: 'Tahun Buku & Periode Akuntansi' }
        ]
      },
      {
        id: 'sys-security',
        title: 'Hak Akses & Keamanan',
        items: [
          { id: 'user-management', title: 'Daftar Pengguna & Kredensial', badge: '32 User' },
          { id: 'rbac-roles', title: 'Role & Matriks Izin Akses (RBAC)', description: 'Kontrol view, edit, delete, dan approve per menu' },
          { id: 'audit-log', title: 'Audit Trail & Log Aktivitas', description: 'Rekam jejak setiap perubahan data & login' },
          { id: 'api-webhooks', title: 'Konektor API & Webhook', badge: 'REST API' }
        ]
      }
    ]
  }
];

export const QUICK_ACTIONS = [
  { id: 'new-so', label: 'Buat Sales Order (SO)', icon: 'FilePlus', module: 'sales', color: 'text-blue-500' },
  { id: 'new-po', label: 'Buat Purchase Order (PO)', icon: 'ShoppingCart', module: 'procurement', color: 'text-violet-500' },
  { id: 'new-spk', label: 'Rilis SPK / Work Order', icon: 'Wrench', module: 'manufacturing', color: 'text-amber-500' },
  { id: 'new-journal', label: 'Entri Jurnal Kas/Bank', icon: 'Coins', module: 'finance', color: 'text-emerald-500' },
  { id: 'new-emp', label: 'Tambah Karyawan Baru', icon: 'UserPlus', module: 'hr', color: 'text-rose-500' },
  { id: 'stock-count', label: 'Mulai Stock Opname', icon: 'QrCode', module: 'inventory', color: 'text-cyan-500' },
];

export const COMPANY_BRANCHES = [
  { id: 'hq-jkt', name: 'PT Artha Mandiri Perkasa (HQ - Jakarta Pusat)', code: 'JKT-01' },
  { id: 'plant-cikarang', name: 'Pabrik & Manufaktur Cikarang (GIIC)', code: 'CKR-PLANT' },
  { id: 'dc-surabaya', name: 'Distribution Center Surabaya (Rungkut)', code: 'SBY-DC' },
  { id: 'branch-medan', name: 'Cabang Regional Sumatera (Medan)', code: 'MDN-01' },
];
