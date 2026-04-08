const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: __dirname + '/.env' });
const axios = require("axios"); // ✅ NEW
const pool = require("./db");

// Twilio Setup
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const twilio = require("twilio");
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const app = express();

app.use(cors());
app.use(express.json());

/* ===================== CHAT API (UPDATED WITH OLLAMA) ===================== */

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Fetch the catalog for the AI
    let catalogStr = "No products currently available in catalog.";
    try {
       const prodRes = await pool.query(`SELECT id, name, category, price FROM products LIMIT 100`);
       catalogStr = prodRes.rows.map(p => `ID:${p.id} | Name: ${p.name} | Category: ${p.category} | Price: ₹${p.price}`).join('\n');
    } catch(err) {
       console.error("Failed to load catalog for prompt", err);
    }

    // 🔹 STEP 1: Call Ollama
    const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2:3b",
      prompt: `
You are a highly intelligent and conversational ecommerce AI assistant for SmartCart.
You have the vast knowledge of Llama 3 and can talk about anything, but your main job is to help customers shop.
Always respond in purely JSON format without markdown blocks.

Here is our entire product catalog:
${catalogStr}

Available actions:
1. "search_product": The user wants to see or find products.
2. "add_to_cart": The user wants to add an item.
3. "remove_from_cart": The user wants to remove an item.
4. "view_cart": The user wants to view their cart.
5. "place_order": The user wants to checkout.
6. "general_chat": The user is asking a general question, asking for advice, or just chatting. Use your vast knowledge to provide a great answer!

Generate a JSON response containing:
- "action": exactly one of the 6 actions above.
- "selected_product_ids": an array of integer IDs from the catalog that best match their input. If they are looking for specific items, select the most relevant matching IDs. Leave as [] if none.
- "ai_reply": Your friendly, knowledgeable AI reply. Answer their questions thoroughly using your intelligence. Be as conversational as a human. If searching, mention you found items.

Example output:
{
  "action": "general_chat",
  "selected_product_ids": [],
  "ai_reply": "Hello! I am the SmartCart AI assistant. I have vast knowledge and I can help you search for products, manage your cart, and place orders. How can I assist you?"
}

User input: "${message}"
Return ONLY JSON.
      `,
      stream: false
    });

    let aiText = ollamaResponse.data.response.trim();
    if (aiText.startsWith('\`\`\`')) {
      aiText = aiText.replace(/^\`\`\`[a-zA-Z]*\n/, '').replace(/\n\`\`\`$/, '').trim();
    }

    // 🔹 STEP 2: Parse JSON safely
    let actionData;
    try {
      actionData = JSON.parse(aiText);
    } catch (err) {
      console.log("AI RAW:", aiText);
      return res.json({ reply: "I'm having a little trouble understanding right now. Could you please rephrase?" });
    }

    let reply = actionData.ai_reply || "";
    let action = null;

    // 🔹 STEP 3: Handle actions

    if (actionData.action === "search_product") {
      try {
        let products = [];
        if (Array.isArray(actionData.selected_product_ids) && actionData.selected_product_ids.length > 0) {
           const ids = actionData.selected_product_ids.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
           if (ids.length > 0) {
             const idList = ids.join(',');
             const res = await pool.query(`SELECT * FROM products WHERE id IN (${idList})`);
             products = res.rows;
           }
        }

        if (products.length > 1) {
          reply = actionData.ai_reply || "Here are some products I found:";
          action = { type: "SHOW_PRODUCTS", payload: products.slice(0, 5) };
        } else if (products.length === 1) {
          reply = actionData.ai_reply || `I found ${products[0].name} for ₹${products[0].price}. Add to cart?`;
          action = { type: "SHOW_PRODUCT", payload: products[0] };
        } else {
          reply = actionData.ai_reply || "I'm sorry, I couldn't find any products matching your search in the catalog right now.";
        }

      } catch (err) {
        console.error("DB ERROR:", err);
        reply = "Sorry, I'm having trouble connecting to the database.";
      }

    } else if (actionData.action === "view_cart") {
      reply = actionData.ai_reply || "Here are the items in your cart.";
      action = { type: "VIEW_CART", payload: null };
    } 
    else if (actionData.action === "add_to_cart") {
      try {
        let products = [];
        if (Array.isArray(actionData.selected_product_ids) && actionData.selected_product_ids.length > 0) {
           const ids = actionData.selected_product_ids.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
           if (ids.length > 0) {
             const idList = ids.join(',');
             const res = await pool.query(`SELECT * FROM products WHERE id IN (${idList})`);
             products = res.rows;
           }
        }
        if (products.length > 0) {
          reply = actionData.ai_reply || `I found ${products[0].name}. I'll add it to your cart.`;
          action = { type: "ADD_TO_CART", payload: products[0] };
        } else {
          reply = actionData.ai_reply || "I'm sorry, I couldn't figure out which item you want to add. Could you be more specific?";
        }
      } catch (err) {
         console.error(err);
         reply = "Sorry, error adding to cart.";
      }
    } 
    else if (actionData.action === "remove_from_cart") {
      try {
        let products = [];
        if (Array.isArray(actionData.selected_product_ids) && actionData.selected_product_ids.length > 0) {
           const ids = actionData.selected_product_ids.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
           if (ids.length > 0) {
             const idList = ids.join(',');
             const res = await pool.query(`SELECT * FROM products WHERE id IN (${idList})`);
             products = res.rows;
           }
        }
        if (products.length > 0) {
          reply = actionData.ai_reply || `I've removed ${products[0].name} from your cart.`;
          action = { type: "REMOVE_FROM_CART", payload: products[0] };
        } else {
          reply = actionData.ai_reply || "I'm sorry, I couldn't figure out which item to remove.";
        }
      } catch (err) {
         console.error(err);
         reply = "Sorry, error removing from cart.";
      }
    } 
    else if (actionData.action === "place_order") {
      reply = actionData.ai_reply || "Proceeding to checkout...";
      action = { type: "NAVIGATE", payload: { url: "/checkout" } };
    } 
    else if (actionData.action === "general_chat") {
      reply = actionData.ai_reply || "I am here to help you with your shopping experience!";
    }
    else {
      reply = actionData.ai_reply || "I can help you find products or place orders.";
    }

    res.json({ reply, action });

  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ error: "Server error" });
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

    // SMS
    if (twilioClient && phone && process.env.TWILIO_PHONE_NUMBER && payment_status !== "Failed") {
      let formattedPhone = phone.startsWith("+") ? phone : "+91" + phone;

      await twilioClient.messages.create({
        body: `Hey ${user_name || 'Customer'}, your order is placed successfully! Amount ₹${amount}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
    }

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