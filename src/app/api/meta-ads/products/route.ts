import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { mapDbRowToProduct } from '@/lib/metaAdsProducts';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const rows = (await query('SELECT * FROM meta_ads_products ORDER BY is_active DESC, nama ASC')) as any[];
    return NextResponse.json({ success: true, data: rows.map(mapDbRowToProduct) });
  } catch (error: any) {
    console.error('Meta Ads Products GET Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil daftar produk.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const nama = String(body.nama || '').trim();
    const sheetUrl = String(body.sheetUrl || '').trim();
    const scalevTestStoreId = body.scalevTestStoreId ? Number(body.scalevTestStoreId) : null;
    const metaAdAccountId = body.metaAdAccountId ? String(body.metaAdAccountId).trim() : null;

    if (!nama || !sheetUrl) {
      return NextResponse.json({ success: false, error: 'Nama produk dan link sheet wajib diisi.' }, { status: 400 });
    }

    const result = (await query(
      'INSERT INTO meta_ads_products (nama, sheet_url, scalev_test_store_id, meta_ad_account_id, dibuat_oleh) VALUES (?, ?, ?, ?, ?)',
      [nama, sheetUrl, scalevTestStoreId, metaAdAccountId, user.nama || user.nama_user || '']
    )) as any;

    return NextResponse.json({ success: true, message: 'Produk berhasil ditambahkan.', id: result.insertId });
  } catch (error: any) {
    console.error('Meta Ads Products POST Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menambahkan produk.' }, { status: 500 });
  }
}
