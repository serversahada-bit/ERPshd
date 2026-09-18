import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const rows = (await query('SELECT api_key FROM scalev_settings WHERE id = 1')) as any[];
    const row = rows[0];
    const isConfigured = Boolean(row?.api_key);
    const maskedKey = isConfigured ? `${String(row.api_key).slice(0, 6)}${'*'.repeat(20)}` : null;
    return NextResponse.json({ success: true, data: { isConfigured, maskedKey } });
  } catch (error: any) {
    console.error('Scalev Settings GET Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil pengaturan Scalev.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const apiKey = String(body.apiKey || '').trim();
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key wajib diisi.' }, { status: 400 });
    }

    await query(
      `INSERT INTO scalev_settings (id, api_key, diubah_oleh) VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE api_key = VALUES(api_key), diubah_oleh = VALUES(diubah_oleh)`,
      [apiKey, user.nama || user.nama_user || '']
    );

    return NextResponse.json({ success: true, message: 'Pengaturan Scalev berhasil disimpan.' });
  } catch (error: any) {
    console.error('Scalev Settings POST Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan pengaturan Scalev.' }, { status: 500 });
  }
}
