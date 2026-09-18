import mysql from 'mysql2/promise';

// Pool koneksi terpisah khusus modul Advertiser/Meta Ads — database sendiri
// (erp_sahada) supaya tidak numpang di database HRIS (Great) yang dipakai db.ts.
export const advertiserDb = mysql.createPool({
  host: process.env.ADVERTISER_DB_HOST || '127.0.0.1',
  port: Number(process.env.ADVERTISER_DB_PORT) || 3306,
  user: process.env.ADVERTISER_DB_USER || 'root',
  password: process.env.ADVERTISER_DB_PASSWORD || '',
  database: process.env.ADVERTISER_DB_NAME || 'erp_sahada',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 15000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export async function queryAdvertiser(sql: string, params: any[] = [], retries = 2): Promise<any> {
  try {
    const [results] = await advertiserDb.execute(sql, params);
    return results;
  } catch (error: any) {
    if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST')) {
      console.warn(`[Advertiser DB] Query gagal (${error.code}), mencoba ulang... (${retries} percobaan tersisa)`);
      await new Promise((res) => setTimeout(res, 1000));
      return queryAdvertiser(sql, params, retries - 1);
    }
    console.error('Advertiser Database Query Error:', error);
    throw error;
  }
}

export interface KaryawanCacheRow {
  id_karyawan: string;
  nama: string;
  nama_user?: string | null;
  password?: string | null;
  jabatan?: string | null;
  organisasi?: string | null;
  posisi?: string | null;
  email?: string | null;
  foto?: string | null;
  status_karyawan?: string | null;
}

// Dipanggil setiap kali ada login (manual atau SSO dari Great) supaya karyawan_cache
// di erp_sahada selalu punya salinan terbaru — dipakai fitur lain (mis. filter karyawan)
// tanpa perlu query silang ke Main DB tiap saat. Sumber kebenaran login tetap Main DB.
// Catatan: password disalin apa adanya (plaintext, mengikuti format sumber di karyawan.password)
// atas permintaan user, untuk persiapan login mandiri dari erp_sahada di masa depan.
export async function cacheKaryawan(row: KaryawanCacheRow): Promise<void> {
  try {
    await queryAdvertiser(
      `INSERT INTO karyawan_cache (id_karyawan, nama, nama_user, password, jabatan, organisasi, posisi, email, foto, status_karyawan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nama = VALUES(nama),
         nama_user = VALUES(nama_user),
         password = VALUES(password),
         jabatan = VALUES(jabatan),
         organisasi = VALUES(organisasi),
         posisi = VALUES(posisi),
         email = VALUES(email),
         foto = VALUES(foto),
         status_karyawan = VALUES(status_karyawan)`,
      [
        row.id_karyawan,
        row.nama,
        row.nama_user ?? null,
        row.password ?? null,
        row.jabatan ?? null,
        row.organisasi ?? null,
        row.posisi ?? null,
        row.email ?? null,
        row.foto ?? null,
        row.status_karyawan ?? null,
      ]
    );
  } catch (error) {
    // Cache sync tidak boleh menggagalkan proses login.
    console.error('[Advertiser DB] Gagal sync karyawan_cache:', error);
  }
}
