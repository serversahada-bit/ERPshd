import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { RAW_FIELDS, fieldValueFromBody } from '@/lib/scriptKonten';
import { fetchAndParseScriptKontenSheet } from '@/lib/scriptKontenImport';
import { mapDbRowToProduct } from '@/lib/metaAdsProducts';

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const sheetUrl = String(body.sheetUrl || '').trim();
    if (!sheetUrl) {
      return NextResponse.json({ success: false, error: 'Link Google Sheets wajib diisi.' }, { status: 400 });
    }

    const productRows = (await query('SELECT * FROM meta_ads_products')) as any[];
    const products = productRows.map(mapDbRowToProduct);
    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Belum ada produk terdaftar. Tambahkan produk dulu di menu Meta Ads.' },
        { status: 400 }
      );
    }

    const { rows, warnings } = await fetchAndParseScriptKontenSheet(sheetUrl, products);

    const columns = ['product_id', ...RAW_FIELDS.map((f) => f.dbColumn), 'id_karyawan', 'nama_karyawan'];
    const placeholders = columns.map(() => '?').join(', ');
    for (const row of rows) {
      const values: (string | number | null)[] = [
        row.productId,
        ...RAW_FIELDS.map((f) => fieldValueFromBody(f, row.fields)),
        user.id_karyawan || '',
        user.nama || user.nama_user || '',
      ];
      await query(`INSERT INTO script_konten (${columns.join(', ')}) VALUES (${placeholders})`, values);
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${rows.length} baris dari spreadsheet.`,
      warnings,
    });
  } catch (error: any) {
    console.error('Script Konten Import Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengimpor data.' }, { status: 500 });
  }
}
