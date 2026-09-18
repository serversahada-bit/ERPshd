import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { RAW_FIELDS, mapDbRowToRecord, withDerived } from '@/lib/metaAds';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = Number(searchParams.get('productId'));
  if (!productId) {
    return NextResponse.json({ success: false, error: 'productId wajib diisi.' }, { status: 400 });
  }

  try {
    const rows = (await query('SELECT * FROM meta_ads_daily WHERE product_id = ? ORDER BY tanggal DESC', [productId])) as any[];
    const data = rows.map((row) => withDerived(mapDbRowToRecord(row)));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Meta Ads GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data Meta Ads.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const productId = Number(body.productId);

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId wajib diisi.' }, { status: 400 });
    }
    if (!body.tanggal) {
      return NextResponse.json({ success: false, error: 'Tanggal wajib diisi.' }, { status: 400 });
    }

    const columns = ['product_id', ...RAW_FIELDS.map((f) => f.dbColumn)];
    const values: (string | number)[] = [
      productId,
      ...RAW_FIELDS.map((f) => (f.key === 'tanggal' ? body.tanggal : f.key === 'grade' ? (body[f.key] || 'B') : Number(body[f.key]) || 0)),
    ];

    const placeholders = columns.map(() => '?').join(', ');

    await query(
      `INSERT INTO meta_ads_daily (${columns.join(', ')}, dibuat_oleh)
       VALUES (${placeholders}, ?)`,
      [...values, user.nama || user.nama_user || '']
    );

    return NextResponse.json({ success: true, message: 'Data berhasil ditambahkan.' });
  } catch (error: any) {
    console.error('Meta Ads POST Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'Tanggal tersebut sudah ada datanya untuk produk ini. Gunakan mode edit.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan data Meta Ads.' },
      { status: 500 }
    );
  }
}
