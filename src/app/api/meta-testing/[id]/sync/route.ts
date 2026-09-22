import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { runMetaTestingSync } from '@/lib/metaTestingSyncRunner';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await runMetaTestingSync(user.nama || user.nama_user || '', Number(id));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Meta Testing Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal sinkronisasi data.' }, { status: 500 });
  }
}
