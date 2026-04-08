const pool = require('./db');
(async () => {
    try {
        const res = await pool.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.log(e);
    }
    process.exit(0);
})();
