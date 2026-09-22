import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { RAW_FIELDS, mapDbRowToRecord, withDerived, applyClosingBoxCsRealLeads, type ClosingBoxCsRealLeadSums } from '@/lib/metaAds';

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
    const [rows, csSums] = await Promise.all([
      query('SELECT * FROM meta_ads_daily WHERE product_id = ? ORDER BY tanggal DESC', [productId]) as Promise<any[]>,
      query(
        `SELECT DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal,
           SUM(lead_form) AS leadForm, SUM(lead_wa) AS leadWa,
           SUM(nc_closing) AS ncClosing, SUM(nc_box) AS ncBox,
           SUM(fu_closing) AS fuClosing, SUM(fu_box) AS fuBox
         FROM closing_box_cs WHERE product_id = ? GROUP BY tanggal`,
        [productId]
      ) as Promise<any[]>,
    ]);

    // Total Closing Box CS per tanggal (semua platform/ADV digabung) dipakai buat menimpa
    // Lead Real/New Customer Real/Follow Up — lihat applyClosingBoxCsRealLeads di lib/metaAds.
    const sumsByTanggal = new Map<string, ClosingBoxCsRealLeadSums>(
      csSums.map((row) => [
        row.tanggal,
        {
          leadForm: Number(row.leadForm), leadWa: Number(row.leadWa),
          ncClosing: Number(row.ncClosing), ncBox: Number(row.ncBox),
          fuClosing: Number(row.fuClosing), fuBox: Number(row.fuBox),
        },
      ])
    );

    const data = rows.map((row) => withDerived(applyClosingBoxCsRealLeads(mapDbRowToRecord(row), sumsByTanggal)));
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
