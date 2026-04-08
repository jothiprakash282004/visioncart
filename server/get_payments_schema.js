const pool = require("./db");
const fs = require("fs");

async function getSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payments'
    `);
    fs.writeFileSync("payments_schema.json", JSON.stringify(res.rows, null, 2));
    console.log("Written to payments_schema.json");
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
getSchema();
