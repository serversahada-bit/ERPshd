import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { RAW_FIELDS, fieldValueFromBody, mapDbRowToMetaTesting, computeMetaTestingBatch } from '@/lib/metaTesting';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = Number(searchParams.get('productId'));

  try {
    const rows = productId
      ? ((await query(
          `SELECT mt.*, mp.nama AS product_nama
           FROM meta_testing mt
           JOIN meta_ads_products mp ON mp.id = mt.product_id
           WHERE mt.product_id = ?
           ORDER BY mt.created_at DESC`,
          [productId]
        )) as any[])
      : ((await query(
          `SELECT mt.*, mp.nama AS product_nama
           FROM meta_testing mt
           JOIN meta_ads_products mp ON mp.id = mt.product_id
           ORDER BY mt.created_at DESC`
        )) as any[]);

    const mapped = rows.map(mapDbRowToMetaTesting);

    // Skor/rank dihitung per batch produk (butuh MAX Spending/Box & ranking Skor Total
    // dalam satu produk) — kalau tidak difilter productId, kelompokkan dulu per produk
    // supaya batch-nya tidak tercampur antar produk.
    let computed: typeof mapped;
    if (productId) {
      computed = computeMetaTestingBatch(mapped);
    } else {
      const byProduct = new Map<number, typeof mapped>();
      for (const row of mapped) {
        const group = byProduct.get(row.productId) || [];
        group.push(row);
        byProduct.set(row.productId, group);
      }
      computed = Array.from(byProduct.values()).flatMap((group) => computeMetaTestingBatch(group));
    }

    return NextResponse.json({ success: true, data: computed });
  } catch (error: any) {
    console.error('Meta Testing GET Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data Meta Testing.' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Produk wajib dipilih.' }, { status: 400 });
    }

    const columns = ['product_id', ...RAW_FIELDS.map((f) => f.dbColumn), 'id_karyawan', 'nama_karyawan'];
    const values: (string | number | null)[] = [
      productId,
      ...RAW_FIELDS.map((f) => fieldValueFromBody(f, body)),
      user.id_karyawan || '',
      user.nama || user.nama_user || '',
    ];
    const placeholders = columns.map(() => '?').join(', ');

    const result = (await query(
      `INSERT INTO meta_testing (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    )) as any;

    return NextResponse.json({ success: true, message: 'Data berhasil ditambahkan.', id: result.insertId });
  } catch (error: any) {
    console.error('Meta Testing POST Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menambahkan data Meta Testing.' }, { status: 500 });
  }
}
