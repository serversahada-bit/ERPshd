'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Share2,
  Users,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  ExternalLink,
  Key,
  Globe,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Lock,
  Smartphone
} from 'lucide-react';
import { COMPANY_PROFILE } from '@/data/retailMenuData';

export default function PengaturanView() {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profil' | 'integrasi' | 'pengguna' | 'notifikasi' | 'keamanan'>('profil');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('PT SAHADA LAKU UTAMA');
  const [tagline, setTagline] = useState('Omnichannel Retail & E-Commerce Enterprise');
  const [address, setAddress] = useState('Jl. Bisnis Terpadu No. 88, Kawasan Niaga Modern, Jakarta Selatan');
  const [email, setEmail] = useState('corporate@sahadalaku.id');
  const [phone, setPhone] = useState('+62 21 8900 1234');
  const [npwp, setNpwp] = useState('01.234.567.8-012.000');

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Settings size={14} />
            <span>Pusat Konfigurasi Sistem ERP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pengaturan & Tata Kelola Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi profil perusahaan, koneksi API marketplace & kurir, izin akses staf, dan proteksi data.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 shrink-0"
        >
          {savedSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Pengaturan sistem PT SAHADA LAKU UTAMA berhasil diperbarui dan diterapkan ke seluruh modul aktif!</span>
        </div>
      )}

      {/* 2. Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'profil', label: 'Profil Perusahaan', icon: Building2 },
          { id: 'integrasi', label: 'Integrasi API & Kurir', icon: Share2 },
          { id: 'pengguna', label: 'Pengguna & Hak Akses', icon: Users },
          { id: 'notifikasi', label: 'Notifikasi & Bot WA', icon: Bell },
          { id: 'keamanan', label: 'Keamanan & Database', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSettingsTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Settings Tab Content */}
      {activeSettingsTab === 'profil' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-extrabold text-base text-slate-900">Identitas Entitas Bisnis</h2>
            <p className="text-xs text-slate-400 mt-0.5">Informasi resmi perusahaan yang tampil pada invoice, PO, dan manifest pengiriman</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Perusahaan Resmi</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori / Sektor Industri</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor NPWP Perusahaan</label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Korespondensi Resmi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Kantor & Gudang Utama</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>
          </div>
        </div>
      )}

      {activeSettingsTab === 'integrasi' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-extrabold text-base text-slate-900">Koneksi API & Saluran Eksternal</h2>
            <p className="text-xs text-slate-400 mt-0.5">Status webhook dan kredensial API yang terhubung dengan modul ERP</p>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Shopee Open Platform API', type: 'Marketplace E-Commerce', status: 'Terhubung (Active)', lastSync: '10 detik lalu', badge: 'bg-emerald-100 text-emerald-800' },
              { name: 'TikTok Shop Partner API', type: 'Live Shopping & Orders', status: 'Terhubung (Active)', lastSync: '15 detik lalu', badge: 'bg-emerald-100 text-emerald-800' },
              { name: 'Meta Conversions API (CAPI)', type: 'Iklan FB & Instagram Tracking', status: 'Optimal (Realtime)', lastSync: 'Realtime Webhook', badge: 'bg-emerald-100 text-emerald-800' },
              { name: 'J&T Express COD Tracking Webhook', type: 'Ekspedisi & Pencairan Dana', status: 'Terhubung', lastSync: '1 menit lalu', badge: 'bg-blue-100 text-blue-800' },
              { name: 'WhatsApp Cloud API (Meta Official)', type: 'Customer Chat & Bot Resi', status: 'Terhubung (Active)', lastSync: '2 menit lalu', badge: 'bg-emerald-100 text-emerald-800' },
            ].map((api, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-slate-900">{api.name}</div>
                  <div className="text-[11px] text-slate-500">{api.type} &bull; Terakhir dicek: {api.lastSync}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${api.badge}`}>
                    {api.status}
                  </span>
                  <button
                    onClick={() => alert(`Menguji koneksi ulang untuk ${api.name}... OK!`)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Test Koneksi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSettingsTab === 'pengguna' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Manajemen Pengguna & Role Staf</h2>
              <p className="text-xs text-slate-400 mt-0.5">Total 248 akun terdaftar pada 10 divisi operasional PT SAHADA LAKU UTAMA</p>
            </div>
            <button
              onClick={() => alert('Modal Tambah Karyawan / Buat Akun Baru dibuka')}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              + Tambah Pengguna
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Pengguna</th>
                  <th className="px-4 py-3">Divisi / Modul</th>
                  <th className="px-4 py-3">Role Akses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">Salsabila Putri (Anda)</td>
                  <td className="px-4 py-3">Operational Lead & Executive</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">Super Administrator</span></td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">Online</td>
                  <td className="px-4 py-3 text-right"><button className="text-blue-600 hover:underline">Edit</button></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">Rendra Pratama</td>
                  <td className="px-4 py-3">Divisi Advertiser & Media Buyer</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">Media Buyer Manager</span></td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">Online</td>
                  <td className="px-4 py-3 text-right"><button className="text-blue-600 hover:underline">Edit</button></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">Bambang Wijaya</td>
                  <td className="px-4 py-3">Divisi Fulfillment & Gudang</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">Warehouse Supervisor</span></td>
                  <td className="px-4 py-3 text-slate-500">Offline</td>
                  <td className="px-4 py-3 text-right"><button className="text-blue-600 hover:underline">Edit</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeSettingsTab === 'notifikasi' || activeSettingsTab === 'keamanan') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-extrabold text-base text-slate-900">
              {activeSettingsTab === 'notifikasi' ? 'Notifikasi & WhatsApp Bot Otomatis' : 'Protokol Keamanan & Database'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Pengaturan alert real-time dan enkripsi data perusahaan</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Kirim Resi Otomatis ke WhatsApp Pembeli</div>
                <div className="text-[11px] text-slate-500">Kirim link pelacakan kurir saat barcode paket selesai di-scan gudang</div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded-sm" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Peringatan Stok Gudang Kritis (&lt; 50 Pcs)</div>
                <div className="text-[11px] text-slate-500">Kirim pesan otomatis ke tim Purchasing untuk segera restok ke pabrik</div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded-sm" />
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Two-Factor Authentication (2FA) untuk Akses FAT & Direksi</div>
                <div className="text-[11px] text-slate-500">Wajibkan verifikasi OTP untuk membuka laporan keuangan dan mutasi kas</div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
