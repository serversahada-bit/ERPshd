import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { RAW_FIELDS, fieldValueFromBody } from '@/lib/scriptKonten';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const productId = Number(body.productId);
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Produk wajib dipilih.' }, { status: 400 });
    }

    const assignments = ['product_id = ?', ...RAW_FIELDS.map((f) => `${f.dbColumn} = ?`), 'diubah_oleh = ?'];
    const values: (string | number | null)[] = [
      productId,
      ...RAW_FIELDS.map((f) => fieldValueFromBody(f, body)),
      user.nama || user.nama_user || '',
    ];

    await query(`UPDATE script_konten SET ${assignments.join(', ')} WHERE id = ?`, [...values, id]);

    return NextResponse.json({ success: true, message: 'Data berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Script Konten PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui data Script & Konten.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await query('DELETE FROM script_konten WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data berhasil dihapus.' });
  } catch (error: any) {
    console.error('Script Konten DELETE Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data Script & Konten.' }, { status: 500 });
  }
}
