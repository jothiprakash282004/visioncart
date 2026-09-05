const { Pool } = require("pg");
require("dotenv").config({ path: __dirname + '/../.env' });

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "smartcart",
  password: process.env.DB_PASSWORD || "tiger",
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

pool.on("connect", () => {
  console.log("✅ Database connected successfully");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err.message);
});

module.exports = pool;
