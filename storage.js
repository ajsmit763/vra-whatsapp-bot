const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

function createPool(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL must be configured privately before starting the bot.');
  return new Pool({ connectionString: url, max: 5, connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000, application_name: 'vra-support-bot' });
}
async function transaction(pool, action) {
  const db = await pool.connect();
  try { await db.query('BEGIN'); const result = await action(db); await db.query('COMMIT'); return result; }
  catch (error) { await db.query('ROLLBACK'); throw error; }
  finally { db.release(); }
}
async function migrate(pool) { await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')); }
module.exports = { createPool, transaction, migrate };
if (require.main === module) {
  const pool = createPool();
  migrate(pool).then(() => console.log('Conversation schema ready.'))
    .catch(() => { console.error('Migration failed. Check database connection and schema permissions.'); process.exitCode = 1; })
    .finally(() => pool.end());
}
