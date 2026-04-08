const pool = require("./db");
const fs = require("fs");
Promise.all([
  pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'user'"),
  pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'")
]).then(res => {
  const result = {
    user: res[0].rows,
    orders: res[1].rows
  };
  fs.writeFileSync('cols.json', JSON.stringify(result, null, 2), 'utf-8');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
