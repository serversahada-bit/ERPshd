import { NextResponse } from 'next/server';
import { queryAdvertiser } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { fetchAdsByIds } from '@/lib/metaGraphApi';

// Ambil nama iklan asli dari daftar Ad ID yang sudah tersimpan (bukan pencarian by nama)
// — dipakai AdIdPicker buat nampilin nama, bukan cuma angka ID, waktu form dibuka.
export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idsParam = (searchParams.get('ids') || '').trim();
  const productId = Number(searchParams.get('productId'));
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ success: true, data: [] });
  }
  if (!productId) {
    return NextResponse.json({ success: false, error: 'Produk wajib dipilih.' }, { status: 400 });
  }

  try {
    const settingsRows = (await queryAdvertiser('SELECT access_token FROM meta_api_settings WHERE id = 1')) as any[];
    const accessToken = settingsRows[0]?.access_token;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Token Meta API belum diatur (menu Meta Ads Live).' }, { status: 400 });
    }

    const results = await fetchAdsByIds(accessToken, ids);
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Meta Ads Lookup Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil detail iklan.' }, { status: 500 });
  }
}
