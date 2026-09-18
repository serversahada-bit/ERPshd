import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { searchAds } from '@/lib/metaGraphApi';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  if (q.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const settingsRows = (await query('SELECT access_token, ad_account_id FROM meta_api_settings WHERE id = 1')) as any[];
    const settings = settingsRows[0];
    if (!settings?.access_token || !settings?.ad_account_id) {
      return NextResponse.json({ success: false, error: 'Meta API belum diatur (menu Meta Ads Live).' }, { status: 400 });
    }

    const results = await searchAds(settings.access_token, settings.ad_account_id, q);
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Meta Ads Search Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mencari iklan.' }, { status: 500 });
  }
}
