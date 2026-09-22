import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2/promise';
import { getSession } from '@/lib/auth';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { isPositiveId, validateClosingBoxCsInput } from '@/lib/closingBoxCs';
import { CS_SELECT, csErrorResponse, csValues, withClosingMetrics, type ClosingBoxCsDbRow } from '@/lib/closingBoxCsDb';

export async function GET(request: Request) {
  if (!await getSession()) return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  const productId = Number(new URL(request.url).searchParams.get('productId'));
  if (!isPositiveId(productId)) return NextResponse.json({ success: false, error: 'Pilih produk yang valid.' }, { status: 400 });
  try {
    const rows = await query(`${CS_SELECT} WHERE product_id = ? ORDER BY tanggal DESC, id DESC`, [productId]) as ClosingBoxCsDbRow[];
    return NextResponse.json({ success: true, data: rows.map(withClosingMetrics) });
  } catch (error) { return csErrorResponse(error); }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  try {
    const data = validateClosingBoxCsInput(await request.json());
    const result = await query(`INSERT INTO closing_box_cs
      (product_id, tanggal, platform, adv, lead_wa, lead_form, nc_closing, nc_box, fu_closing, fu_box, dibuat_oleh)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.productId, ...csValues(data), user.nama || user.nama_user || user.id_karyawan]) as ResultSetHeader;
    return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
  } catch (error) { return csErrorResponse(error); }
}
