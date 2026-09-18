import mysql from 'mysql2/promise';

// Pool koneksi MySQL — memakai database online yang sama dengan aplikasi Great (HRIS)
export const db = mysql.createPool({
  host: process.env.DB_HOST || 'srv1321.hstgr.io',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'u313218767_great',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u313218767_great',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 15000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Helper function untuk eksekusi query dengan retry
export async function query(sql: string, params: any[] = [], retries = 2): Promise<any> {
  try {
    const [results] = await db.execute(sql, params);
    return results;
  } catch (error: any) {
    if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST')) {
      console.warn(`[DB] Query gagal (${error.code}), mencoba ulang... (${retries} percobaan tersisa)`);
      await new Promise((res) => setTimeout(res, 1000));
      return query(sql, params, retries - 1);
    }
    console.error('Database Query Error:', error);
    throw error;
  }
}
