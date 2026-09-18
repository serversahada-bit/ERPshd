import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';

function maskToken(token: string | null): string {
  if (!token) return '';
  if (token.length <= 8) return '••••••••';
  return `${token.slice(0, 6)}${'•'.repeat(10)}${token.slice(-4)}`;
}

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const rows = (await query('SELECT * FROM meta_api_settings WHERE id = 1')) as any[];
    const row = rows[0];

    return NextResponse.json({
      success: true,
      data: {
        hasToken: Boolean(row?.access_token),
        maskedToken: maskToken(row?.access_token || null),
        adAccountId: row?.ad_account_id || '',
        accountName: row?.account_name || '',
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
    const adAccountId = String(body.adAccountId || '').trim();
    const accountName = String(body.accountName || '').trim();

    if (!accessToken || !adAccountId) {
      return NextResponse.json({ success: false, error: 'Access Token dan Ad Account ID wajib diisi.' }, { status: 400 });
    }

    await query(
      `INSERT INTO meta_api_settings (id, access_token, ad_account_id, account_name, diubah_oleh)
       VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), ad_account_id = VALUES(ad_account_id),
         account_name = VALUES(account_name), diubah_oleh = VALUES(diubah_oleh)`,
      [accessToken, adAccountId, accountName, user.nama || user.nama_user || '']
    );

    return NextResponse.json({ success: true, message: 'Kredensial berhasil disimpan.' });
  } catch (error: any) {
    console.error('Meta Graph Settings POST Error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan kredensial.' }, { status: 500 });
  }
}
