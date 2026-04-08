const pool = require("./db");

async function test() {
  const name = "Test2 Name";
  const email = "test2@example.com";
  const password = "password123";
  try {
    const userExist = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    console.log("userExist rows length:", userExist.rows.length);

    console.log("Trying to insert...");
    const newUser = await pool.query(
      'INSERT INTO "user" (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password]
    );
    console.log("Success Insert:", newUser.rows[0]);
  } catch (err) {
    console.error("DB Error Message:", err.message);
    console.error("Full Error:", err);
  }
  process.exit(0);
}
test();
