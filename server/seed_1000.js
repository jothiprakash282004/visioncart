const pool = require("./db");

// Category mapping to match the frontend categories smoothly
const categoryMap = {
  "smartphones": "Mobiles",
  "laptops": "Electronics",
  "fragrances": "Fashion",
  "skincare": "Fashion",
  "groceries": "Groceries",
  "home-decoration": "Home & Kitchen",
  "furniture": "Home & Kitchen",
  "tops": "Fashion",
  "womens-dresses": "Fashion",
  "womens-shoes": "Fashion",
  "mens-shirts": "Fashion",
  "mens-shoes": "Fashion",
  "mens-watches": "Fashion",
  "womens-watches": "Fashion",
  "womens-bags": "Fashion",
  "womens-jewellery": "Fashion",
  "sunglasses": "Fashion",
  "automotive": "Electronics",
  "motorcycle": "Electronics",
  "lighting": "Home & Kitchen",
  "beauty": "Fashion"
};

async function seedDatabase() {
  try {
    console.log("Fetching exactly 150 products from dummyjson to ensure EXACT photos for each item...");
    const response = await fetch("https://dummyjson.com/products?limit=150");
    const data = await response.json();
    
    const products = data.products.map((p, index) => {
      // Map category or fallback to Capitalized string
      let cat = categoryMap[p.category] || (p.category.charAt(0).toUpperCase() + p.category.slice(1));
      
      return {
        id: index + 1, // Start IDs from 1 sequentially
        name: p.title,
        price: Math.round(p.price * 80), // Convert to scale reflecting INR prices
        category: cat,
        image: p.thumbnail // Provides exact exact photo of the titular item
      };
    });

    console.log("Connecting to database and clearing existing products...");
    await pool.query("TRUNCATE TABLE products RESTART IDENTITY CASCADE");

    console.log(`Inserting ${products.length} products into database. This might take a few seconds...`);
    
    // Batch insert
    for (let i = 0; i < products.length; i += 50) {
      const chunk = products.slice(i, i + 50);
      const values = [];
      const queries = [];
      let paramCount = 1;

      for (const p of chunk) {
        queries.push(`($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`);
        values.push(p.id, p.name, p.category, p.price, p.image);
      }
      
      const queryText = `INSERT INTO products (id, name, destription, price, image_url) VALUES ${queries.join(', ')}`;
      await pool.query(queryText, values);
    }
    
    console.log(`Seeding completed successfully! ${products.length} products added.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

seedDatabase();
