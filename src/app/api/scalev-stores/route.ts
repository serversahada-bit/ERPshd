import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { fetchScalevStores } from '@/lib/scalevApi';

// Daftar store Scalev buat dropdown "Scalev Test Store ID" di Master Produk —
// menghindarkan user dari harus buka dashboard Scalev manual buat cari ID.
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const rows = (await query('SELECT api_key FROM scalev_settings WHERE id = 1')) as any[];
    const apiKey = rows[0]?.api_key;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key Scalev belum diatur.' }, { status: 400 });
    }

    const stores = await fetchScalevStores(apiKey);
    return NextResponse.json({ success: true, data: stores });
  } catch (error: any) {
    console.error('Scalev Stores GET Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil daftar store Scalev.' }, { status: 500 });
  }
}
