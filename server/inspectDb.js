const pool = require('./db.js');
const fs = require('fs');
async function inspect() {
  try {
    const res = await pool.query('SELECT * FROM products LIMIT 5;');
    fs.writeFileSync('db_out_utf8.json', JSON.stringify(res.rows, null, 2), 'utf8');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
inspect();
