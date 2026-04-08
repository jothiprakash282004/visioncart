const pool = require('./db');

const categoriesMap = {
  "Beauty": [/Mascara/i, /Eyeshadow/i, /Powder/i, /Lipstick/i, /Nail Polish/i, /Eau de/i, /Noir/i, /Perfume/i, /J'adore/i, /CK One/i],
  "Furniture": [/Bed/i, /Sofa/i, /Table/i, /Chair/i, /Sink/i],
  "Groceries": [/Apple/i, /Steak/i, /Food/i, /Meat/i, /Oil/i, /Cucumber/i, /Eggs/i, /Pepper/i, /Honey/i, /Ice Cream/i, /Juice/i, /Kiwi/i, /Lemon/i, /Milk/i, /Mulberry/i, /Coffee/i, /Potatoes/i, /Protein/i, /Onions/i, /Rice/i, /Drinks/i, /Strawberry/i, /Tissue/i, /Water/i],
  "Home Decor": [/Swing/i, /Frame/i, /Showpiece/i, /Plant/i, /Lamp/i],
  "Kitchenware": [/Spatula/i, /Cup/i, /Whisk/i, /Blender/i, /Wok/i, /Board/i, /Squeezer/i, /Slicer/i, /Stove/i, /Strainer/i, /Fork/i, /Glass/i, /Grater/i, /Tray/i, /Sieve/i, /Knife/i, /Lunch Box/i, /Oven/i, /Mug/i, /Pan/i, /Plate/i, /Tongs/i, /Pot/i, /Turner/i, /Spice/i, /Spoon/i, /Rolling Pin/i, /Peeler/i],
  "Laptops": [/Laptop/i, /MacBook/i, /Zenbook/i, /Matebook/i, /XPS/i],
  "Clothing": [/Shirt/i, /Tshirt/i],
  "Footwear": [/Jordan/i, /Cleats/i, /Sneakers/i, /Trainers/i, /Shoe/i],
  "Watches": [/Watch/i, /Longines/i, /Rolex/i],
  "Gadgets": [/Echo/i, /Airpods/i, /Airpower/i, /HomePod/i, /Charger/i, /Battery/i, /Earphones/i, /Case/i, /Monopod/i, /Lamp with iPhone/i, /Selfie/i, /Camera Pedestal/i],
  "Motorcycles": [/Motorcycle/i, /Kawasaki/i, /MotoGP/i],
  "Personal Care": [/Soap/i, /Body Wash/i, /Lotion/i],
  "Smartphones": [/iPhone 5/i, /iPhone 6/i, /iPhone 8/i, /iPhone 13/i, /iPhone X/i, /Oppo/i, /Realme/i, /Samsung/i, /Vivo/i],
  "Sports": [/Football/i, /Baseball/i, /Basketball/i, /Cricket/i, /Shuttlecock/i, /Golf/i, /Bat/i]
};

function getCategory(name) {
  for (const [category, regexes] of Object.entries(categoriesMap)) {
    for (const regex of regexes) {
      if (regex.test(name)) {
        return category;
      }
    }
  }
  return "General";
}

async function updateCategories() {
  try {
    const result = await pool.query("SELECT id, name FROM products");
    const products = result.rows;

    for (const product of products) {
      const category = getCategory(product.name);
      await pool.query("UPDATE products SET category = $1 WHERE id = $2", [category, product.id]);
    }
    console.log("Successfully updated all categories.");
  } catch (err) {
    console.error("Error updating categories", err);
  } finally {
    pool.end();
  }
}

updateCategories();
