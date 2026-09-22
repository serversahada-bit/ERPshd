import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { fetchAdAccounts } from '@/lib/metaGraphApi';

// Daftar Ad Account Meta buat dropdown "Meta Ad Account ID" di Master Produk —
// menghindarkan user dari harus buka Ads Manager manual buat cari ID.
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const rows = (await query('SELECT access_token FROM meta_api_settings WHERE id = 1')) as any[];
    const accessToken = rows[0]?.access_token;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Access Token Meta belum diatur.' }, { status: 400 });
    }

    const accounts = await fetchAdAccounts(accessToken);
    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    console.error('Meta Ad Accounts GET Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil daftar Ad Account.' }, { status: 500 });
  }
}
