const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: __dirname + '/.env' });
const pool = require("./db");
const { spawn } = require("child_process");
const path = require("path");



const app = express();

app.use(cors());
app.use(express.json());

/* ===================== CHAT API (PYTHON GEMINI) ===================== */

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let responseSent = false; // Flag to prevent multiple responses

    // Spawn Python process to call chatbot.py with environment variables
    const pythonScript = path.join(__dirname, "chatbot.py");
    const python = spawn("python", [pythonScript, message], {
      cwd: __dirname,
      env: { ...process.env }  // Pass all environment variables including GOOGLE_API_KEY
    });

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (responseSent) return; // Prevent multiple responses
      responseSent = true;

      if (code !== 0 && errorOutput) {
        console.error("Python error:", errorOutput);
        return res.json({
          reply: "Sorry, I encountered an error processing your request. Please try again."
        });
      }

      const trimmed = output.trim();
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && (parsed.reply || parsed.action)) {
          return res.json(parsed);
        }
      } catch {
        // ignore invalid JSON and fall back to plain reply
      }
      return res.json({ reply: trimmed });
    });

    python.on("error", (err) => {
      if (responseSent) return; // Prevent multiple responses
      responseSent = true;

      console.error("Failed to start Python process:", err);
      res.json({
        reply: "Sorry, I'm having trouble connecting to the chatbot. Please try again."
      });
    });

    // Timeout after 30 seconds - only send if no response sent yet
    setTimeout(() => {
      if (responseSent) return; // Prevent multiple responses
      responseSent = true;

      python.kill();
      res.json({
        reply: "The chatbot took too long to respond. Please try again."
      });
    }, 30000);

  } catch (error) {
    console.error("CHAT ERROR:", error);
    if (!res.headersSent) {
      res.json({ reply: "An error occurred. Please try again later." });
    }
  }
});

/* ===================== AUTH APIs ===================== */

// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, password]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: _, ...userData } = user.rows[0];
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===================== PRODUCTS ===================== */

app.get("/api/products", async (req, res) => {
  try {
    const data = await pool.query("SELECT * FROM products");
    res.json(data.rows);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===================== ORDERS ===================== */

app.post("/api/orders", async (req, res) => {
  const { user_id, total_amount, status } = req.body;
  try {
    const order = await pool.query(
      'INSERT INTO orders (user_id, total_amount, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [user_id, total_amount, status || "Pending"]
    );
    res.json(order.rows[0]);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===================== PAYMENTS ===================== */

app.post("/api/payments", async (req, res) => {
  const { order_id, user_id, amount, phone, payment_method, payment_status, transaction_id, user_name } = req.body;

  try {
    const payment = await pool.query(
      `INSERT INTO payments 
       (order_id, user_id, amount, currency, payment_method, payment_status, transaction_id, payment_date, created_at) 
       VALUES ($1, $2, $3, 'INR', $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [order_id, user_id, amount, payment_method, payment_status || "Success", transaction_id || `TXN${Date.now()}`]
    );



    res.json(payment.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===================== SERVER ===================== */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});