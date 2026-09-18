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

export interface AdSearchResult {
  id: string;
  name: string;
  status: string;
}

/** Cari iklan (ad) berdasarkan nama di satu ad account — dipakai untuk dropdown pilih Ad ID di form Meta Testing. */
export async function searchAds(accessToken: string, adAccountId: string, query: string): Promise<AdSearchResult[]> {
  const id = normalizeAdAccountId(adAccountId);
  const data = await graphGet<{ data: { id: string; name: string; status: string }[] }>(`/${id}/ads`, accessToken, {
    fields: 'id,name,status',
    filtering: JSON.stringify([{ field: 'ad.name', operator: 'CONTAIN', value: query }]),
    limit: '25',
  });
  return (data.data || []).map((a) => ({ id: a.id, name: a.name, status: a.status }));
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

/**
 * Ambil metrik performa satu iklan (ad) spesifik untuk kebutuhan Meta Testing.
 *
 * Definisi yang dipakai (diverifikasi lewat data akun & disepakati dengan user):
 * - Lead = actions dengan action_type "onsite_conversion.messaging_conversation_started_*"
 *   atau "onsite_conversion.messaging_first_reply" (metrik standar Click-to-WhatsApp Meta).
 * - Hook Rate = video_play_actions / impressions (proxy "video diputar" — field
 *   video_continuous_2_sec_watched_actions tidak tersedia di versi Graph API akun ini).
 * - Hold Rate = video_thruplay_watched_actions / video_play_actions (ThruPlay sebagai
 *   persentase dari yang mulai menonton).
 */
export async function fetchAdInsight(accessToken: string, adId: string, since?: string): Promise<AdInsight> {
  const params: Record<string, string> = {
    fields:
      'spend,impressions,ctr,cpm,actions,video_play_actions,video_thruplay_watched_actions',
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
      ctr?: string;
      cpm?: string;
      actions?: InsightAction[];
      video_play_actions?: InsightAction[];
      video_thruplay_watched_actions?: InsightAction[];
    }[];
  }>(`/${adId}/insights`, accessToken, params);

  const row = data.data?.[0];
  if (!row) {
    return { spend: 0, impressions: 0, ctr: 0, cpm: 0, totalLead: 0, hookRate: 0, holdRate: 0 };
  }

  const impressions = Number(row.impressions) || 0;
  const videoPlays = sumActionValue(row.video_play_actions, () => true);
  const thruplays = sumActionValue(row.video_thruplay_watched_actions, () => true);
  const totalLead = sumActionValue(
    row.actions,
    (type) => type.startsWith('onsite_conversion.messaging_conversation_started') || type === 'onsite_conversion.messaging_first_reply'
  );

  return {
    spend: Number(row.spend) || 0,
    impressions,
    ctr: Number(row.ctr) || 0,
    cpm: Number(row.cpm) || 0,
    totalLead,
    hookRate: impressions > 0 ? (videoPlays / impressions) * 100 : 0,
    holdRate: videoPlays > 0 ? (thruplays / videoPlays) * 100 : 0,
  };
}
