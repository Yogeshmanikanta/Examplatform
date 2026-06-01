import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Force UTC timezone and test connection on startup
(async () => {
  const client = await pool.connect();
  try {
    await client.query("SET timezone='UTC'");
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  } finally {
    client.release();
  }
})();

export default pool;