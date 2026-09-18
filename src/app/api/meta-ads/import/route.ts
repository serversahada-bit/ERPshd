import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { runMetaAdsImport } from '@/lib/metaAdsImportRunner';

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  let productId: number | undefined;
  let sheetUrl: string | undefined;
  try {
    const body = await request.json();
    productId = Number(body?.productId) || undefined;
    sheetUrl = typeof body?.sheetUrl === 'string' ? body.sheetUrl : undefined;
  } catch {
    // body kosong -> productId tetap undefined, ditangani di bawah
  }

  if (!productId) {
    return NextResponse.json({ success: false, error: 'productId wajib diisi.' }, { status: 400 });
  }

  try {
    const { imported, warnings } = await runMetaAdsImport(user.nama || user.nama_user || 'Import Sheet', productId, sheetUrl);

    return NextResponse.json({
      success: true,
      message: `Berhasil impor ${imported} baris data dari Google Sheets.`,
      imported,
      warnings,
    });
  } catch (error: any) {
    console.error('Meta Ads Import Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengimpor data dari Google Sheets.' },
      { status: 500 }
    );
  }
}
