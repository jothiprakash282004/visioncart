const pool = require('./db');

const addresses = [
    "123 Main St, Springfield, IL",
    "456 Oak Avenue, Metropolis, NY",
    "789 Pine Road, Gotham, NJ",
    "321 Elm Street, Star City, CA",
    "654 Maple Drive, Central City, OH",
    "987 Cedar Blvd, Coast City, FL"
];

function generateDescription(productName) {
    return `Discover the exceptional quality and innovative design of the ${productName}. Carefully crafted to meet your everyday needs, this outstanding product combines premium materials with cutting-edge functionality. Whether you are seeking reliability, aesthetic appeal, or long-lasting durability, it truly delivers on all fronts. The meticulous attention to detail ensures a superior user experience, making it a perfect addition to your lifestyle. Designed for those who appreciate excellence, it stands out as a reliable companion for various occasions. Enjoy the seamless blend of comfort and performance that sets a new standard in its category. Invest in this remarkable item today and experience the difference it brings to your routine. It also serves as a wonderful gift for friends and family, reflecting thoughtful consideration and uncompromising taste.`;
}

(async () => {
    try {
        console.log("Fetching products...");
        const res = await pool.query("SELECT id, name FROM products");
        const products = res.rows;
        
        console.log(`Updating details for ${products.length} products...`);
        for (let p of products) {
            const desc = generateDescription(p.name);
            const brand = p.name.split(' ')[0] || p.name; // Use first word of name as brand
            const address = addresses[Math.floor(Math.random() * addresses.length)];
            
            // Upsert into product_details (if it doesn't exist, though it seems it was already created)
            // We can just use an UPDATE or INSERT ON CONFLICT depending on the primary key, but let's check.
            // In db_schema.json there is product_details. Let's do an UPDATE where id = p.id
            const updateRes = await pool.query(
                `UPDATE product_details 
                 SET description = $1, product_name = $2, brand = $3, address = $4 
                 WHERE id = $5`,
                [desc, p.name, brand, address, p.id]
            );
            
            // If the row doesn't exist, we should INSERT it. Wait, the previous migration seeded product_details.
            if (updateRes.rowCount === 0) {
                 await pool.query(
                    `INSERT INTO product_details (id, description, product_name, brand, address, price)
                     VALUES ($1, $2, $3, $4, $5, (SELECT price FROM products WHERE id = $1))`,
                    [p.id, desc, p.name, brand, address]
                 );
            }
        }
        
        console.log("Finished updating product_details.");
    } catch (e) {
        console.error("Error updating:", e);
    }
    process.exit(0);
})();
