const pool = require('./db');
const fs = require('fs');

(async () => {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_details'");
        const res2 = await pool.query("SELECT * FROM product_details LIMIT 5");
        const res3 = await pool.query("SELECT * FROM products LIMIT 10");
        
        fs.writeFileSync('out.json', JSON.stringify({
            schema: res.rows,
            data_details: res2.rows,
            data_products: res3.rows.map(r => ({id: r.id, name: r.name}))
        }, null, 2), 'utf-8');
    } catch (e) {
        console.log(e);
    }
    process.exit(0);
})();
