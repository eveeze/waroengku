const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/warung?sslmode=disable',
});
async function run() {
  const res = await pool.query('SELECT id, name, is_active FROM customers ORDER BY created_at DESC LIMIT 5');
  console.log(res.rows);
  pool.end();
}
run();
