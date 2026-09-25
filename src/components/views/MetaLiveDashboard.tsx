'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, PlugZap, CheckCircle2, RefreshCw, Settings2, Download } from 'lucide-react';
import { MetaAdsProduct } from '@/lib/metaAdsProducts';
import ProductSelector from '../ProductSelector';
import SearchableSelect from './SearchableSelect';

interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpm: number;
}

const DATE_PRESETS = [
  { value: 'today', label: 'Hari Ini' },
  { value: 'yesterday', label: 'Kemarin' },
  { value: 'last_7d', label: '7 Hari Terakhir' },
  { value: 'this_month', label: 'Bulan Ini' },
];

function formatCurrency(n: number) {
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
}
function formatNumber(n: number) {
  return Math.round(n).toLocaleString('id-ID');
}

interface MetaAdAccountOption {
  id: string;
  name: string;
}

function SetupForm({
  productId,
  productNama,
  hasGlobalToken,
  existingAdAccountId,
  onConnected,
}: {
  productId: number;
  productNama: string;
  hasGlobalToken: boolean;
  existingAdAccountId: string;
  onConnected: () => void;
}) {
  const [accessToken, setAccessToken] = useState('');
  const [adAccountId, setAdAccountId] = useState(existingAdAccountId);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adAccounts, setAdAccounts] = useState<MetaAdAccountOption[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  // Kalau Access Token global sudah tersimpan, langsung ambil daftar Ad Account asli dari
  // token itu — tidak perlu user cari & ketik ID manual dari Ads Manager.
  useEffect(() => {
    if (!hasGlobalToken) return;
    setIsLoadingAccounts(true);
    fetch('/api/meta-graph/accounts')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAdAccounts(json.data as MetaAdAccountOption[]);
        else setAccountsError(json.error || 'Gagal memuat daftar Ad Account.');
      })
      .catch(() => setAccountsError('Gagal terhubung ke Meta API.'))
      .finally(() => setIsLoadingAccounts(false));
  }, [hasGlobalToken]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/meta-graph/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, adAccountId, productId }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Gagal terhubung ke Meta API.');
        return;
      }

      setSuccess(json.message);
      setTimeout(onConnected, 800);
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <PlugZap size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900">Hubungkan Meta Ads API — {productNama}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Ambil data campaign langsung dari akun iklan Meta untuk produk ini.</p>
        </div>
      </div>

      <form onSubmit={handleConnect} className="space-y-3">
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Access Token {hasGlobalToken && <span className="font-normal text-slate-400">(sudah tersimpan, isi lagi kalau mau ganti)</span>}
          </label>
          <textarea
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            rows={3}
            placeholder={hasGlobalToken ? '•••••••••••••••••••• (biarkan kosong kalau tidak ganti)' : 'EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Dari Meta for Developers &rarr; Graph API Explorer, atau System User token dengan izin <code>ads_read</code>. Token ini
            dipakai bersama untuk semua produk.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ad Account ID (khusus produk ini)</label>
          {hasGlobalToken && !accountsError ? (
            <SearchableSelect
              value={adAccountId}
              onChange={setAdAccountId}
              options={adAccounts.map((a) => ({ id: a.id, label: a.name }))}
              disabled={isLoadingAccounts}
              disabledPlaceholder="Memuat akun..."
              placeholder="Ketik buat cari Ad Account..."
            />
          ) : (
            <input
              type="text"
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              placeholder="act_1234567890 atau 1234567890"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          )}
          <p className="text-[11px] text-slate-400 mt-1">
            {hasGlobalToken && !accountsError
              ? 'Diambil otomatis dari Access Token yang tersimpan. Tiap produk boleh punya Ad Account ID berbeda.'
              : 'Terlihat di Ads Manager, di URL atau pengaturan akun. Tiap produk boleh punya Ad Account ID berbeda.'}
          </p>
          {accountsError && <p className="text-[10px] text-rose-500 mt-1">{accountsError} — isi manual di atas dulu.</p>}
        </div>

        <button
          type="submit"
          disabled={isTesting || (!accessToken.trim() && !hasGlobalToken) || !adAccountId.trim()}
          className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
        >
          {isTesting && <Loader2 size={13} className="animate-spin" />}
          <span>Tes Koneksi &amp; Simpan</span>
        </button>
      </form>
    </div>
  );
}

export default function MetaLiveDashboard() {
  const searchParams = useSearchParams();
  const pid = searchParams.get('pid');
  const productId = pid ? Number(pid) : null;

  const [checking, setChecking] = useState(true);
  const [product, setProduct] = useState<MetaAdsProduct | null>(null);
  const [hasGlobalToken, setHasGlobalToken] = useState(false);
  const [connected, setConnected] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignInsight[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pullError, setPullError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState('today');

  const checkSettings = useCallback(async () => {
    if (!productId) return;
    setChecking(true);
    try {
      const [settingsRes, productsRes] = await Promise.all([
        fetch('/api/meta-graph/settings'),
        fetch('/api/meta-ads/products'),
      ]);
      const settingsJson = await settingsRes.json();
      const productsJson = await productsRes.json();

      const hasToken = Boolean(settingsJson.success && settingsJson.data.hasToken);
      setHasGlobalToken(hasToken);

      const found = productsJson.success ? (productsJson.data as MetaAdsProduct[]).find((p) => p.id === productId) : null;
      setProduct(found || null);
      setConnected(Boolean(hasToken && found?.metaAdAccountId));
    } finally {
      setChecking(false);
    }
  }, [productId]);

  useEffect(() => {
    checkSettings();
  }, [checkSettings]);

  const loadCampaigns = useCallback(async () => {
    if (!productId) return;
    setIsLoadingCampaigns(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/meta-graph/campaigns?datePreset=${datePreset}&productId=${productId}`);
      const json = await res.json();
      if (!json.success) {
        setLoadError(json.error || 'Gagal mengambil data campaign.');
        return;
      }
      setCampaigns(json.data as CampaignInsight[]);
      setLastFetchedAt(json.lastFetchedAt || null);
    } catch {
      setLoadError('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [datePreset, productId]);

  useEffect(() => {
    if (connected) loadCampaigns();
  }, [connected, loadCampaigns]);

  const handlePull = async () => {
    if (!productId) return;
    setIsPulling(true);
    setPullError(null);
    try {
      const res = await fetch('/api/meta-graph/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datePreset, productId }),
      });
      const json = await res.json();
      if (!json.success) {
        setPullError(json.error || 'Gagal menarik data dari Meta API.');
        return;
      }
      await loadCampaigns();
    } catch {
      setPullError('Terjadi kesalahan jaringan.');
    } finally {
      setIsPulling(false);
    }
  };

  // Selalu tampil (termasuk saat checking/belum ada productId) — ProductSelector di sini
  // yang tugasnya auto-pilih produk pertama & set ?pid= kalau belum ada di URL, jadi tidak
  // boleh disembunyikan di balik kondisi `!productId` (bisa bikin loading tidak pernah selesai).
  const productHeader = (
    <div className="flex justify-end">
      <ProductSelector />
    </div>
  );

  if (!productId || checking) {
    return (
      <div className="space-y-5">
        {productHeader}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          <span>Memeriksa koneksi...</span>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-5">
        {productHeader}
        <SetupForm
          productId={productId}
          productNama={product?.nama || ''}
          hasGlobalToken={hasGlobalToken}
          existingAdAccountId={product?.metaAdAccountId || ''}
          onConnected={() => checkSettings()}
        />
      </div>
    );
  }

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-slate-900">Dashboard Meta</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">Live API</span>
          {product && <span className="text-xs text-slate-400 truncate">&middot; {product.nama} ({product.metaAdAccountId})</span>}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <ProductSelector />
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            onClick={handlePull}
            disabled={isPulling}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            {isPulling ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            <span>Tarik Data Terbaru</span>
          </button>
          <button
            onClick={loadCampaigns}
            disabled={isLoadingCampaigns}
            className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-60"
            title="Muat ulang dari database"
          >
            {isLoadingCampaigns ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
          <button
            onClick={() => setConnected(false)}
            className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
            title="Ganti Kredensial"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {lastFetchedAt && (
        <p className="text-[11px] text-slate-400 -mt-3 px-1">
          Data tersimpan, terakhir ditarik dari Meta:{' '}
          {new Date(lastFetchedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      )}

      {pullError && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-2xs p-4 text-center text-rose-600 text-xs font-semibold">
          {pullError}
        </div>
      )}

      {campaigns.length === 0 && !isLoadingCampaigns && !loadError && !pullError && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-8 text-center">
          <p className="text-sm font-semibold text-slate-600">Belum ada data tersimpan</p>
          <p className="text-xs text-slate-400 mt-1">Klik &quot;Tarik Data Terbaru&quot; untuk mengambil data campaign dari Meta API.</p>
        </div>
      )}

      {loadError && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-2xs p-6 text-center text-rose-600 text-sm font-semibold">
          {loadError}
        </div>
      )}

      {!loadError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
              <div className="text-[11px] font-semibold text-slate-500">Total Spend</div>
              <div className="text-lg font-extrabold text-slate-900 mt-1">{formatCurrency(totalSpend)}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
              <div className="text-[11px] font-semibold text-slate-500">Total Impressions</div>
              <div className="text-lg font-extrabold text-slate-900 mt-1">{formatNumber(totalImpressions)}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
              <div className="text-[11px] font-semibold text-slate-500">Total Clicks</div>
              <div className="text-lg font-extrabold text-slate-900 mt-1">{formatNumber(totalClicks)}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Performa per Campaign</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Campaign</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Spend</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Impressions</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Reach</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Clicks</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">CTR</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">CPM</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 && !isLoadingCampaigns && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                        Tidak ada aktivitas campaign untuk periode ini.
                      </td>
                    </tr>
                  )}
                  {campaigns.map((c, i) => (
                    <tr key={c.campaignId} className={i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                      <td className="px-5 py-3 font-semibold text-slate-700">{c.campaignName}</td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatCurrency(c.spend)}</td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatNumber(c.impressions)}</td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatNumber(c.reach)}</td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatNumber(c.clicks)}</td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{c.ctr.toFixed(2)}%</td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatCurrency(c.cpm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
