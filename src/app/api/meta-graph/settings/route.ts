import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';

function maskToken(token: string | null): string {
  if (!token) return '';
  if (token.length <= 8) return '••••••••';
  return `${token.slice(0, 6)}${'•'.repeat(10)}${token.slice(-4)}`;
}

// Access Token Meta tetap global (satu System User token bisa akses banyak Ad Account) —
// Ad Account ID sendiri sekarang per-produk, lihat meta_ads_products.meta_ad_account_id.
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const rows = (await query('SELECT access_token FROM meta_api_settings WHERE id = 1')) as any[];
    const row = rows[0];

    return NextResponse.json({
      success: true,
      data: {
        hasToken: Boolean(row?.access_token),
        maskedToken: maskToken(row?.access_token || null),
      },
    });
  } catch (error: any) {
    console.error('Meta Graph Settings GET Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil pengaturan.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const accessToken = String(body.accessToken || '').trim();

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Access Token wajib diisi.' }, { status: 400 });
    }

    await query(
      `INSERT INTO meta_api_settings (id, access_token, diubah_oleh)
       VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), diubah_oleh = VALUES(diubah_oleh)`,
      [accessToken, user.nama || user.nama_user || '']
    );

    return NextResponse.json({ success: true, message: 'Access Token berhasil disimpan.' });
  } catch (error: any) {
    console.error('Meta Graph Settings POST Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan Access Token.' }, { status: 500 });
  }
}
