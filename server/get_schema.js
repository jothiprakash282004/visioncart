const pool = require('./db');

(async () => {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_details'");
        console.log("product_details schema:", res.rows);

        const res2 = await pool.query("SELECT * FROM product_details LIMIT 5");
        console.log("product_details data:", res2.rows);

        const res3 = await pool.query("SELECT * FROM products LIMIT 10");
        console.log("products data sample:", res3.rows.map(r => ({id: r.id, name: r.name})));
    } catch (e) {
        console.log(e);
    }
    process.exit(0);
})();
