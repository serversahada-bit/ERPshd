import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2/promise';
import { getSession } from '@/lib/auth';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { isPositiveId, validateClosingBoxCsInput } from '@/lib/closingBoxCs';
import { csErrorResponse, csValues } from '@/lib/closingBoxCsDb';

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  const user = await getSession();
  if (!user) return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  const id = Number((await params).id);
  if (!isPositiveId(id)) return NextResponse.json({ success: false, error: 'ID tidak valid.' }, { status: 400 });
  try {
    const data = validateClosingBoxCsInput(await request.json());
    const result = await query(`UPDATE closing_box_cs SET tanggal = ?, platform = ?, adv = ?,
      lead_wa = ?, lead_form = ?, nc_closing = ?, nc_box = ?, fu_closing = ?, fu_box = ?, diubah_oleh = ?
      WHERE id = ? AND product_id = ?`,
    [...csValues(data), user.nama || user.nama_user || user.id_karyawan, id, data.productId]) as ResultSetHeader;
    if (!result.affectedRows) return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) { return csErrorResponse(error); }
}

export async function DELETE(request: Request, { params }: Context) {
  if (!await getSession()) return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  const id = Number((await params).id);
  const productId = Number(new URL(request.url).searchParams.get('productId'));
  if (!isPositiveId(id) || !isPositiveId(productId)) return NextResponse.json({ success: false, error: 'ID atau produk tidak valid.' }, { status: 400 });
  try {
    const result = await query('DELETE FROM closing_box_cs WHERE id = ? AND product_id = ?', [id, productId]) as ResultSetHeader;
    if (!result.affectedRows) return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) { return csErrorResponse(error); }
}
