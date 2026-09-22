import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { RAW_FIELDS, AUTO_FROM_CLOSING_BOX_CS_KEYS } from '@/lib/metaAds';

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

    if (!body.tanggal) {
      return NextResponse.json({ success: false, error: 'Tanggal wajib diisi.' }, { status: 400 });
    }

    // Lead Real/New Customer Real/Follow Up tidak lagi diedit lewat form ini (dihitung otomatis
    // dari Closing Box CS) — dikecualikan dari UPDATE supaya nilai fallback lama tidak ketiban 0
    // tiap kali baris ini diedit untuk field lain.
    const editableFields = RAW_FIELDS.filter((f) => !AUTO_FROM_CLOSING_BOX_CS_KEYS.includes(f.key));
    const columns = editableFields.map((f) => f.dbColumn);
    const values = editableFields.map((f) => (f.key === 'tanggal' ? body.tanggal : f.key === 'grade' ? (body[f.key] || 'B') : Number(body[f.key]) || 0));

    const setClause = columns.map((c) => `${c} = ?`).join(', ');

    const result = (await query(
      `UPDATE meta_ads_daily SET ${setClause}, diubah_oleh = ? WHERE id = ?`,
      [...values, user.nama || user.nama_user || '', numericId]
    )) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Data berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Meta Ads PUT Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'Tanggal tersebut sudah dipakai baris data lain.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data Meta Ads.' },
      { status: 500 }
    );
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
    const result = (await query('DELETE FROM meta_ads_daily WHERE id = ?', [numericId])) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Data berhasil dihapus.' });
  } catch (error: any) {
    console.error('Meta Ads DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data Meta Ads.' },
      { status: 500 }
    );
  }
}
