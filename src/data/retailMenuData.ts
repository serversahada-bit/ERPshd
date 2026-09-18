export interface RetailSubmenuItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
}

export interface RetailModule {
  id: string;
  code: string;
  title: string;
  category: 'advertiser' | 'branding' | 'cscrm' | 'fat' | 'fulfillment' | 'purchasing' | 'it' | 'communication' | 'hr' | 'executive' | 'calendar' | 'settings' | 'produk';
  categoryLabel: string;
  subtitle: string;
  description: string;
  icon: string;
  iconBgColor: string;
  accentColor: string;
  statusText: string;
  version: string;
  badgeCategory: string;
  themeColor: 'blue' | 'rose' | 'emerald' | 'amber' | 'purple' | 'teal' | 'indigo' | 'slate' | 'cyan' | 'orange';
  metrics?: {
    label: string;
    value: string;
    note?: string;
  };
  submenus: RetailSubmenuItem[];
}

export const COMPANY_PROFILE = {
  name: 'PT SAHADA LAKU UTAMA',
  code: 'SLU',
  industry: 'Omnichannel Retail & E-Commerce',
  activeModules: 11,
  activeUsers: 248,
  systemUptime: '98.7%',
  todayTransactions: '12,480'
};

export const RETAIL_CATEGORIES = [
  { id: 'all', label: 'Semua Modul', count: 11 },
  { id: 'operasional', label: 'Operasional Retail (Baris 1)', count: 5 },
  { id: 'manajemen', label: 'Manajemen & Sistem (Baris 2)', count: 6 },
] as const;

export const RETAIL_MODULES: RetailModule[] = [
  // ================= 1. ADVERTISER (IKON BIRU) =================
  {
    id: 'advertiser',
    code: 'ADV-01',
    title: 'Advertiser',
    category: 'advertiser',
    categoryLabel: 'Pemasaran',
    badgeCategory: 'Pemasaran',
    themeColor: 'blue',
    subtitle: 'Meta Ads, Google Ads & Marketplace',
    description: 'Pusat kendali iklan berbayar: pantau budget harian, real-time ROAS, CPR, dan scale-up kampanye iklan.',
    icon: 'Megaphone',
    iconBgColor: 'bg-[#2563EB] text-white',
    accentColor: 'text-[#2563EB]',
    statusText: 'Aktif',
    version: 'v2.4',
    metrics: { label: 'ROAS Hari Ini', value: '4.85x', note: 'Spend: Rp 12.4 Jt' },
    submenus: [
      { id: 'meta', title: 'Meta Ads (FB & IG)', description: 'Scale-up budget iklan Facebook & Instagram', badge: 'Live' },
      { id: 'google-tiktok-ads', title: 'Google & TikTok Ads', description: 'Search, Shopping, dan TikTok Live Shopping Ads' },
      { id: 'marketplace-ads', title: 'Marketplace (Shopee / Tokped)', description: 'Iklan pencarian & flash sale toko resmi' }
    ]
  },

  // ================= 2. BRANDING (IKON PINK/ROSE) =================
  {
    id: 'branding',
    code: 'BRD-01',
    title: 'Branding',
    category: 'branding',
    categoryLabel: 'Kreatif',
    badgeCategory: 'Kreatif',
    themeColor: 'rose',
    subtitle: 'Konten Kreatif, KOL & Desain Kemasan',
    description: 'Pusat kreatif merek: manajemen endorsement KOL/Influencer, jadwal syuting video, dan aset kemasan produk.',
    icon: 'Palette',
    iconBgColor: 'bg-[#E11D48] text-white',
    accentColor: 'text-[#E11D48]',
    statusText: 'Aktif',
    version: 'v2.0',
    metrics: { label: 'KOL Aktif', value: '28 Talent', note: 'Engage Rate: 6.4%' },
    submenus: [
      { id: 'kol-endorse', title: 'Manajemen KOL & Endorsement', description: 'Daftar talent, briefing konten, dan jadwal posting' },
      { id: 'studio-creative', title: 'Produksi Video & Foto Produk', description: 'Pipeline syuting materi promosi & hook video' },
      { id: 'brand-assets', title: 'Desain Kemasan & Brand Assets', description: 'Master packaging, stiker label, dan materi cetak' },
      { id: 'script-konten', title: 'Script dan Konten', description: 'Perencanaan naskah & brief konten sebelum produksi dan testing' },
      { id: 'meta-testing', title: 'Meta Testing', description: 'Tracking & scoring konten iklan yang sedang ditesting' }
    ]
  },

  // ================= 3. CS & CRM (IKON HIJAU ZAMRUD) =================
  {
    id: 'cscrm',
    code: 'CS-01',
    title: 'CS & CRM',
    category: 'cscrm',
    categoryLabel: 'Pelayanan',
    badgeCategory: 'Pelayanan',
    themeColor: 'emerald',
    subtitle: 'WhatsApp Chat & Pembagian Leads Otomatis',
    description: 'Pusat komunikasi pelanggan: pembagian leads WhatsApp otomatis ke tim CS, chat multi-agent, dan follow-up CRM.',
    icon: 'MessageCircle',
    iconBgColor: 'bg-[#10B981] text-white',
    accentColor: 'text-[#10B981]',
    statusText: 'Aktif',
    version: 'v3.1',
    metrics: { label: 'Closing Rate', value: '38.4%', note: 'Total 450 Leads' },
    submenus: [
      { id: 'leads-rotator', title: 'Pembagian Leads (Rotator)', description: 'Distribusi prospek adil & otomatis ke nomor tim CS', badge: 'Auto' },
      { id: 'live-chat-wa', title: 'WhatsApp Live Chat', description: 'Kotak masuk multi-agen dengan template pesan cepat' },
      { id: 'customer-crm', title: 'Data Pelanggan & Repeat Order', description: 'Riwayat belanja, broadcast VIP, dan telemarketing' }
    ]
  },

  // ================= 4. FAT (IKON ORANYE/EMAS) =================
  {
    id: 'fat',
    code: 'FAT-01',
    title: 'FAT',
    category: 'fat',
    categoryLabel: 'Keuangan',
    badgeCategory: 'Keuangan',
    themeColor: 'amber',
    subtitle: 'Finance, Accounting, Tax & Audit Pencairan COD',
    description: 'Pusat pengelolaan finansial: arus kas harian, pencairan uang pesanan COD kurir, buku besar, dan pajak perusahaan.',
    icon: 'Calculator',
    iconBgColor: 'bg-[#F59E0B] text-white',
    accentColor: 'text-[#F59E0B]',
    statusText: 'Aktif',
    version: 'v2.8',
    metrics: { label: 'Kas Cair COD', value: 'Rp 142.5 Jt', note: '99.2% Cocok' },
    submenus: [
      { id: 'finance-cashflow', title: 'Finance & Arus Kas', description: 'Pencatatan kas masuk/keluar, petty cash, dan bank' },
      { id: 'cod-remittance', title: 'Pencairan Dana COD Kurir', description: 'Rekonsiliasi pencairan uang tagihan COD ekspedisi', badge: 'Kritis' },
      { id: 'accounting-tax', title: 'Accounting & Laba Rugi', description: 'Hitung HPP otomatis, neraca keuangan, dan PPN/PPh' }
    ]
  },

  // ================= 5. FULFILLMENT (IKON UNGU) =================
  {
    id: 'fulfillment',
    code: 'FUL-01',
    title: 'Fulfillment',
    category: 'fulfillment',
    categoryLabel: 'Logistik',
    badgeCategory: 'Logistik',
    themeColor: 'purple',
    subtitle: 'Packing, Scan Barcode, Ekspedisi Kurir & Stok Retur',
    description: 'Pusat operasional fisik: cetak resi pengiriman massal, scan packing pesanan, cek stok multi-gudang, dan paket retur.',
    icon: 'Package',
    iconBgColor: 'bg-[#8B5CF6] text-white',
    accentColor: 'text-[#8B5CF6]',
    statusText: 'Aktif',
    version: 'v3.5',
    metrics: { label: 'Paket Diproses', value: '1.480 Resi', note: 'Selesai 96%' },
    submenus: [
      { id: 'packing-shipping', title: 'Packing & Cetak Resi', description: 'Cetak label barcode thermal dan scan verifikasi packing' },
      { id: 'courier-manifest', title: 'Ekspedisi & Kurir (COD)', description: 'Manifest serah terima kurir (J&T, SiCepat, Ninja, JNE)' },
      { id: 'warehouse-stock', title: 'Stok Barang & Multi-Gudang', description: 'Update stok real-time, opname, dan retur gagal kirim' }
    ]
  },

  // ================= 6. PURCHASING & VENDOR (IKON VIOLET) =================
  {
    id: 'purchasing',
    code: 'PUR-01',
    title: 'Purchasing & Vendor',
    category: 'purchasing',
    categoryLabel: 'Pengadaan',
    badgeCategory: 'Pengadaan',
    themeColor: 'indigo',
    subtitle: 'Surat Pesanan PO Pabrik & Penerimaan Barang',
    description: 'Pusat pengadaan barang: pembuatan PO supplier/pabrik konveksi, estimasi jadwal restok, dan quality control (QC).',
    icon: 'Factory',
    iconBgColor: 'bg-[#6366F1] text-white',
    accentColor: 'text-[#6366F1]',
    statusText: 'Aktif',
    version: 'v1.8',
    metrics: { label: 'PO Berjalan', value: '6 Pabrik', note: 'Total 15.000 Pcs' },
    submenus: [
      { id: 'po-vendor', title: 'Surat Pesanan (PO Pabrik)', description: 'Penerbitan PO resmi, term pembayaran, dan DP vendor' },
      { id: 'restock-buffer', title: 'Restok Barang Laris', description: 'Peringatan stok kritis & rekomendasi jumlah re-order' },
      { id: 'qc-inbound', title: 'Penerimaan Barang Masuk (QC)', description: 'Pemeriksaan kualitas fisik barang dari pabrik' }
    ]
  },

  // ================= 7. IT & SISTEM (IKON SLATE) =================
  {
    id: 'it-system',
    code: 'IT-01',
    title: 'IT & Sistem',
    category: 'it',
    categoryLabel: 'Teknologi',
    badgeCategory: 'Teknologi',
    themeColor: 'slate',
    subtitle: 'Integrasi API/Webhooks & Hak Akses Staf',
    description: 'Infrastruktur teknologi: integrasi API omnichannel, webhook real-time kurir, dan pengaturan izin hak akses (roles).',
    icon: 'Terminal',
    iconBgColor: 'bg-[#334155] text-white',
    accentColor: 'text-[#334155]',
    statusText: 'Optimal',
    version: 'v4.0',
    metrics: { label: 'API Uptime', value: '99.9%', note: '0 Error Log' },
    submenus: [
      { id: 'api-webhooks', title: 'Integrasi API & Webhooks', description: 'Koneksi API Shopee, TikTok Shop, Meta CAPI & Kurir' },
      { id: 'roles-permissions', title: 'Manajemen Hak Akses Staf', description: 'Pengaturan otorisasi akun staf per divisi operasional' },
      { id: 'system-logs', title: 'Log Aktivitas & Audit Keamanan', description: 'Riwayat login dan rekaman aktivitas transaksi sistem' }
    ]
  },

  // ================= 8. CHAT & DISKUSI (IKON TOSKA/TEAL) =================
  {
    id: 'team-chat',
    code: 'CHT-01',
    title: 'Chat & Diskusi',
    category: 'communication',
    categoryLabel: 'Komunikasi',
    badgeCategory: 'Komunikasi',
    themeColor: 'teal',
    subtitle: 'Channel Obrolan Antar Divisi & Notifikasi',
    description: 'Platform koordinasi internal perusahaan: channel obrolan khusus per departemen, diskusi proyek, dan bot notifikasi.',
    icon: 'MessagesSquare',
    iconBgColor: 'bg-[#0D9488] text-white',
    accentColor: 'text-[#0D9488]',
    statusText: 'Aktif',
    version: 'v2.2',
    metrics: { label: 'Pesan Hari Ini', value: '1.240 Chat', note: '12 Channel Aktif' },
    submenus: [
      { id: 'channel-divisi', title: 'Channel Tim Antar Divisi', description: 'Ruang koordinasi cepat CS, Gudang, FAT, & Advertiser' },
      { id: 'management-broadcast', title: 'Pengumuman Manajemen', description: 'Siaran resmi direksi, SOP baru, dan jadwal event' },
      { id: 'bot-alerts', title: 'Bot Notifikasi Otomatis', description: 'Notifikasi otomatis order masuk, resi dicetak & stok habis' }
    ]
  },

  // ================= 9. HR & PAYROLL (IKON MERAH/ROSE) =================
  {
    id: 'hr-payroll',
    code: 'HR-01',
    title: 'HR & Payroll',
    category: 'hr',
    categoryLabel: 'SDM',
    badgeCategory: 'SDM',
    themeColor: 'rose',
    subtitle: 'Absensi Shift, Komisi Closing & Slip Gaji',
    description: 'Pusat manajemen SDM: pencatatan absensi tim, kalkulasi otomatis komisi penjualan/closing, dan penerbitan slip gaji.',
    icon: 'Users',
    iconBgColor: 'bg-[#E11D48] text-white',
    accentColor: 'text-[#E11D48]',
    statusText: 'Aktif',
    version: 'v2.5',
    metrics: { label: 'Total Karyawan', value: '64 Staf', note: 'Payroll Ready' },
    submenus: [
      { id: 'attendance-shift', title: 'Absensi Shift (CS & Gudang)', description: 'Jadwal kerja shift pagi/malam, lembur, dan izin' },
      { id: 'sales-commission', title: 'Komisi Closing Paket', description: 'Perhitungan otomatis bonus per paket sukses terkirim' },
      { id: 'payroll-slip', title: 'Penggajian & Slip Gaji', description: 'Generate slip gaji PDF, transfer bank, dan potongan BPJS' }
    ]
  },

  // ================= 10. EXECUTIVE DASHBOARD (IKON INDIGO/GRADIEN) =================
  {
    id: 'executive-bi',
    code: 'EXC-01',
    title: 'Executive Dashboard',
    category: 'executive',
    categoryLabel: 'Direksi',
    badgeCategory: 'Direksi',
    themeColor: 'indigo',
    subtitle: 'Pantauan Omset Bersih, Rasio COD & Efisiensi Iklan',
    description: 'Pusat pantauan khusus Pemilik & Direktur: real-time omset bersih, margin EBITDA, rasio sukses kirim COD, dan ROI iklan.',
    icon: 'BarChart3',
    iconBgColor: 'bg-[#4F46E5] text-white',
    accentColor: 'text-[#4F46E5]',
    statusText: 'Eksklusif',
    version: 'v3.0',
    metrics: { label: 'Net Profit Margin', value: '24.6%', note: 'Target: >20%' },
    submenus: [
      { id: 'net-revenue-ebitda', title: 'Pantauan Omset Bersih (EBITDA)', description: 'Laporan pendapatan riil setelah potongan retur & diskon' },
      { id: 'cod-delivery-ratio', title: 'Rasio Sukses Kirim COD (DSR %)', description: 'Analisis persentase paket terkirim vs gagal kirim kurir' },
      { id: 'ad-efficiency-mer', title: 'Efisiensi Iklan (MER & ROAS)', description: 'Perbandingan total biaya iklan terhadap total omset kotor' }
    ]
  },

  // ================= 11. MASTER PRODUK (IKON TOSKA) =================
  {
    id: 'produk-master',
    code: 'PRD-01',
    title: 'Master Produk',
    category: 'produk',
    categoryLabel: 'Master Data',
    badgeCategory: 'Master Data',
    themeColor: 'cyan',
    subtitle: 'Kelola Jenis Produk Lintas Modul',
    description: 'Pusat data produk: tambah/ubah jenis produk yang dipakai bersama oleh modul Advertiser, Branding, Script & Konten, dan Meta Testing.',
    icon: 'Store',
    iconBgColor: 'bg-[#0891B2] text-white',
    accentColor: 'text-[#0891B2]',
    statusText: 'Aktif',
    version: 'v1.0',
    metrics: { label: 'Total Produk', value: '1 Produk', note: 'Aktif dipakai' },
    submenus: [
      { id: 'daftar-produk', title: 'Daftar Jenis Produk', description: 'Tambah, ubah, aktif/nonaktifkan, dan hapus jenis produk' }
    ]
  }
];
