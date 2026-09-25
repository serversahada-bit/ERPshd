// Klien tipis untuk Meta Marketing API (Graph API) — dipakai untuk menarik
// data campaign Meta Ads langsung dari akun iklan resmi (bukan dari sheet).
// Referensi: https://developers.facebook.com/docs/marketing-api/insights

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface MetaApiError {
  message: string;
  type?: string;
  code?: number;
}

function normalizeAdAccountId(raw: string): string {
  const trimmed = (raw || '').trim();
  return trimmed.startsWith('act_') ? trimmed : `act_${trimmed}`;
}

async function graphGet<T>(path: string, accessToken: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${GRAPH_BASE_URL}${path}`);
  url.searchParams.set('access_token', accessToken);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { cache: 'no-store' });
  const json = await res.json();

  if (!res.ok || json.error) {
    const err: MetaApiError = json.error || { message: `HTTP ${res.status}` };
    throw new Error(err.message || 'Gagal menghubungi Meta API.');
  }

  return json as T;
}

export interface AdAccountInfo {
  name: string;
  accountStatus: number;
  currency: string;
}

/** Tes koneksi: pastikan token & Ad Account ID valid dengan ambil info dasar akun. */
export async function testMetaConnection(accessToken: string, adAccountId: string): Promise<AdAccountInfo> {
  const id = normalizeAdAccountId(adAccountId);
  const data = await graphGet<{ name: string; account_status: number; currency: string }>(`/${id}`, accessToken, {
    fields: 'name,account_status,currency',
  });
  return { name: data.name, accountStatus: data.account_status, currency: data.currency };
}

export interface MetaAdAccount {
  id: string;
  name: string;
}

/**
 * Daftar semua Ad Account yang bisa diakses token ini — dipakai buat dropdown (searchable)
 * pilih Meta Ad Account ID di Master Produk, supaya tidak perlu cari manual ID-nya di Ads
 * Manager. Sengaja TIDAK ambil info Business Manager (field `business{id,name}` butuh
 * permission `business_management`, jauh lebih berisiko daripada `ads_read` — kalau token
 * ini bocor, `business_management` bisa dipakai buat ubah akses/aset bisnis, bukan cuma
 * baca data) — dropdown searchable di UI sudah cukup buat masalah daftar panjang, tanpa
 * perlu permission tambahan itu.
 */
export async function fetchAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  const data = await graphGet<{ data: { account_id: string; name: string }[] }>('/me/adaccounts', accessToken, {
    fields: 'account_id,name',
    limit: '200',
  });
  return (data.data || []).map((a) => ({ id: a.account_id, name: a.name }));
}

export interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpm: number;
}

/**
 * Ambil ringkasan performa per campaign untuk rentang tanggal tertentu.
 * `datePreset` pakai istilah resmi Meta: today, yesterday, last_7d, last_30d, this_month, dst.
 */
export async function fetchCampaignInsights(accessToken: string, adAccountId: string, datePreset = 'today'): Promise<CampaignInsight[]> {
  const id = normalizeAdAccountId(adAccountId);
  const data = await graphGet<{
    data: {
      campaign_id: string;
      campaign_name: string;
      spend?: string;
      impressions?: string;
      reach?: string;
      clicks?: string;
      ctr?: string;
      cpm?: string;
    }[];
  }>(`/${id}/insights`, accessToken, {
    level: 'campaign',
    date_preset: datePreset,
    fields: 'campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpm',
  });

  return (data.data || []).map((row) => ({
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    spend: Number(row.spend) || 0,
    impressions: Number(row.impressions) || 0,
    reach: Number(row.reach) || 0,
    clicks: Number(row.clicks) || 0,
    ctr: Number(row.ctr) || 0,
    cpm: Number(row.cpm) || 0,
  }));
}

export interface AccountDailyInsight {
  spend: number;
  reach: number;
  impressions: number;
  linkClicks: number;
  viewContent: number;
  addToCart: number;
  initiateCheckout: number;
}

interface DailyInsightAction {
  action_type: string;
  value: string;
}

function sumDailyAction(actions: DailyInsightAction[] | undefined, types: string[]): number {
  if (!actions) return 0;
  return actions.filter((a) => types.includes(a.action_type)).reduce((sum, a) => sum + (Number(a.value) || 0), 0);
}

/**
 * Ambil ringkasan performa SATU AKUN iklan untuk SATU hari spesifik — dipakai buat
 * auto-isi field Spend Iklan/Jangkauan/Impresi/Klik Tautan/Tayangan Konten/Add To
 * Chart/IC Form di form Tambah Data Meta Ads. Field lain (Form Scalev, WA Iklan, dst)
 * tetap manual karena definisinya belum dikonfirmasi user.
 * - "Klik Tautan" pakai inline_link_clicks (klik ke link tujuan), bukan field "clicks"
 *   umum yang juga menghitung klik lain (like, comment, dsb).
 * - "Tayangan Konten"/"Add To Chart"/"IC Form" ternyata funnel e-commerce standar Meta
 *   Pixel (VC/ATC/IC = View Content/Add To Cart/Initiate Checkout, dikonfirmasi user
 *   dari pola nama "Rasio VC >70%" dst) — pakai action_type standar Meta, keduanya versi
 *   omni (lintas kanal) dan versi pixel biasa dijumlah supaya konsisten dengan sumber apa
 *   pun kejadiannya tercatat.
 */
export async function fetchAccountDailyInsight(accessToken: string, adAccountId: string, date: string): Promise<AccountDailyInsight> {
  const id = normalizeAdAccountId(adAccountId);
  const data = await graphGet<{
    data: { spend?: string; reach?: string; impressions?: string; inline_link_clicks?: string; actions?: DailyInsightAction[] }[];
  }>(`/${id}/insights`, accessToken, {
    time_range: JSON.stringify({ since: date, until: date }),
    fields: 'spend,reach,impressions,inline_link_clicks,actions',
  });

  const row = data.data?.[0];
  if (!row) return { spend: 0, reach: 0, impressions: 0, linkClicks: 0, viewContent: 0, addToCart: 0, initiateCheckout: 0 };

  return {
    spend: Number(row.spend) || 0,
    reach: Number(row.reach) || 0,
    impressions: Number(row.impressions) || 0,
    linkClicks: Number(row.inline_link_clicks) || 0,
    viewContent: sumDailyAction(row.actions, ['view_content', 'omni_view_content']),
    addToCart: sumDailyAction(row.actions, ['add_to_cart', 'omni_add_to_cart']),
    initiateCheckout: sumDailyAction(row.actions, ['initiate_checkout', 'omni_initiated_checkout']),
  };
}

export interface AdSearchResult {
  id: string;
  name: string;
  status: string;
  adsetName: string;
  campaignName: string;
}

/**
 * Cari iklan (ad) berdasarkan nama di satu ad account — dipakai untuk dropdown pilih Ad
 * ID di form Meta Testing. Ikut ambil nama ad set & campaign karena nama iklan yang sama
 * persis kadang diupload ulang ke beberapa ad set berbeda (duplikat nama, ID beda) —
 * tanpa info ini user tidak bisa bedain mana yang benar cuma dari nama.
 */
export async function searchAds(accessToken: string, adAccountId: string, query: string): Promise<AdSearchResult[]> {
  const id = normalizeAdAccountId(adAccountId);
  const data = await graphGet<{
    data: { id: string; name: string; status: string; adset?: { name: string }; campaign?: { name: string } }[];
  }>(`/${id}/ads`, accessToken, {
    fields: 'id,name,status,adset{name},campaign{name}',
    filtering: JSON.stringify([{ field: 'ad.name', operator: 'CONTAIN', value: query }]),
    limit: '25',
  });
  return (data.data || []).map((a) => ({
    id: a.id,
    name: a.name,
    status: a.status,
    adsetName: a.adset?.name || '',
    campaignName: a.campaign?.name || '',
  }));
}

/**
 * Ambil detail beberapa Ad ID langsung (bukan cari by nama) — dipakai buat nampilin nama
 * asli iklan yang Ad ID-nya sudah tersimpan sebelumnya (mis. saat buka form Edit Meta
 * Testing), supaya tidak cuma nampilin angka ID mentah ke user.
 */
export async function fetchAdsByIds(accessToken: string, adIds: string[]): Promise<AdSearchResult[]> {
  if (adIds.length === 0) return [];
  const data = await graphGet<
    Record<string, { id: string; name: string; status: string; adset?: { name: string }; campaign?: { name: string } }>
  >('/', accessToken, {
    ids: adIds.join(','),
    fields: 'id,name,status,adset{name},campaign{name}',
  });
  return Object.values(data).map((a) => ({
    id: a.id,
    name: a.name,
    status: a.status,
    adsetName: a.adset?.name || '',
    campaignName: a.campaign?.name || '',
  }));
}

export interface AdInsight {
  spend: number;
  impressions: number;
  ctr: number;
  cpm: number;
  totalLead: number;
  hookRate: number;
  holdRate: number;
}

interface InsightAction {
  action_type: string;
  value: string;
}

function sumActionValue(actions: InsightAction[] | undefined, matcher: (actionType: string) => boolean): number {
  if (!actions) return 0;
  return actions.filter((a) => matcher(a.action_type)).reduce((sum, a) => sum + (Number(a.value) || 0), 0);
}

// Angka mentah yang bisa dijumlahkan langsung antar Ad ID (beda dari rasio seperti
// CTR/CPM/Hook/Hold Rate, yang HARUS dihitung ulang dari total angka mentah gabungan,
// bukan dijumlah/dirata-rata langsung dari rasio per-ad — itu akan menghasilkan angka
// yang salah kalau volume tiap ad beda-beda).
interface RawAdMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  videoPlays: number;
  thruplays: number;
  totalLead: number;
}

const EMPTY_RAW_METRICS: RawAdMetrics = { spend: 0, impressions: 0, clicks: 0, videoPlays: 0, thruplays: 0, totalLead: 0 };

/**
 * Ambil angka mentah satu iklan (ad) spesifik untuk kebutuhan Meta Testing.
 *
 * Definisi yang dipakai (diverifikasi lewat data akun & disepakati dengan user):
 * - Lead = actions dengan action_type "onsite_conversion.messaging_conversation_started_*"
 *   atau "onsite_conversion.messaging_first_reply" (metrik standar Click-to-WhatsApp Meta).
 * - Hook Rate = video_play_actions / impressions (proxy "video diputar" — field
 *   video_continuous_2_sec_watched_actions tidak tersedia di versi Graph API akun ini).
 * - Hold Rate = video_thruplay_watched_actions / video_play_actions (ThruPlay sebagai
 *   persentase dari yang mulai menonton).
 */
async function fetchAdRawMetrics(accessToken: string, adId: string, since?: string): Promise<RawAdMetrics> {
  const params: Record<string, string> = {
    fields: 'spend,impressions,clicks,actions,video_play_actions,video_thruplay_watched_actions',
  };
  if (since) {
    params.time_range = JSON.stringify({ since, until: new Date().toISOString().slice(0, 10) });
  } else {
    params.date_preset = 'maximum';
  }

  const data = await graphGet<{
    data: {
      spend?: string;
      impressions?: string;
      clicks?: string;
      actions?: InsightAction[];
      video_play_actions?: InsightAction[];
      video_thruplay_watched_actions?: InsightAction[];
    }[];
  }>(`/${adId}/insights`, accessToken, params);

  const row = data.data?.[0];
  if (!row) return { ...EMPTY_RAW_METRICS };

  return {
    spend: Number(row.spend) || 0,
    impressions: Number(row.impressions) || 0,
    clicks: Number(row.clicks) || 0,
    videoPlays: sumActionValue(row.video_play_actions, () => true),
    thruplays: sumActionValue(row.video_thruplay_watched_actions, () => true),
    totalLead: sumActionValue(
      row.actions,
      (type) => type.startsWith('onsite_conversion.messaging_conversation_started') || type === 'onsite_conversion.messaging_first_reply'
    ),
  };
}

function deriveAdInsight(raw: RawAdMetrics): AdInsight {
  return {
    spend: raw.spend,
    impressions: raw.impressions,
    ctr: raw.impressions > 0 ? (raw.clicks / raw.impressions) * 100 : 0,
    cpm: raw.impressions > 0 ? (raw.spend / raw.impressions) * 1000 : 0,
    totalLead: raw.totalLead,
    hookRate: raw.impressions > 0 ? (raw.videoPlays / raw.impressions) * 100 : 0,
    holdRate: raw.videoPlays > 0 ? (raw.thruplays / raw.videoPlays) * 100 : 0,
  };
}

/** Ambil metrik performa satu Ad ID. */
export async function fetchAdInsight(accessToken: string, adId: string, since?: string): Promise<AdInsight> {
  return deriveAdInsight(await fetchAdRawMetrics(accessToken, adId, since));
}

/**
 * Ambil & gabungkan metrik performa dari BEBERAPA Ad ID sekaligus (satu konten yang sama
 * disebar ke beberapa ad set/campaign) — Spend/Impressions/Lead dijumlah, lalu CTR/CPM/Hook
 * Rate/Hold Rate dihitung ULANG dari total gabungan (bukan rata-rata rasio per-ad).
 */
export async function fetchCombinedAdInsight(accessToken: string, adIds: string[], since?: string): Promise<AdInsight> {
  const rawList = await Promise.all(adIds.map((id) => fetchAdRawMetrics(accessToken, id, since)));
  const summed = rawList.reduce<RawAdMetrics>(
    (acc, r) => ({
      spend: acc.spend + r.spend,
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
      videoPlays: acc.videoPlays + r.videoPlays,
      thruplays: acc.thruplays + r.thruplays,
      totalLead: acc.totalLead + r.totalLead,
    }),
    { ...EMPTY_RAW_METRICS }
  );
  return deriveAdInsight(summed);
}
