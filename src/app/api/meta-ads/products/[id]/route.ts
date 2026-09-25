import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!numericId) {
    return NextResponse.json({ success: false, error: 'ID tidak valid.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (typeof body.nama === 'string') {
      fields.push('nama = ?');
      values.push(body.nama.trim());
    }
    if (typeof body.sheetUrl === 'string') {
      fields.push('sheet_url = ?');
      values.push(body.sheetUrl.trim());
    }
    if (typeof body.isActive === 'boolean') {
      fields.push('is_active = ?');
      values.push(body.isActive ? 1 : 0);
    }
    if ('scalevTestStoreId' in body) {
      fields.push('scalev_test_store_id = ?');
      values.push(body.scalevTestStoreId ? Number(body.scalevTestStoreId) : null);
    }
    if ('metaAdAccountId' in body) {
      fields.push('meta_ad_account_id = ?');
      values.push(body.metaAdAccountId ? String(body.metaAdAccountId).trim() : null);
    }
    if ('scalevStoreId' in body) {
      fields.push('scalev_store_id = ?');
      values.push(body.scalevStoreId ? Number(body.scalevStoreId) : null);
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada perubahan yang dikirim.' }, { status: 400 });
    }

    const result = (await query(`UPDATE meta_ads_products SET ${fields.join(', ')} WHERE id = ?`, [...values, numericId])) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Produk berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Meta Ads Products PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui produk.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!numericId) {
    return NextResponse.json({ success: false, error: 'ID tidak valid.' }, { status: 400 });
  }

  try {
    const [{ count }] = (await query('SELECT COUNT(*) as count FROM meta_ads_products')) as any[];
    if (count <= 1) {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa menghapus produk terakhir. Minimal harus ada 1 produk.' },
        { status: 400 }
      );
    }

    const result = (await query('DELETE FROM meta_ads_products WHERE id = ?', [numericId])) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Produk (beserta seluruh data hariannya) berhasil dihapus.' });
  } catch (error: any) {
    console.error('Meta Ads Products DELETE Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus produk.' }, { status: 500 });
  }
}
