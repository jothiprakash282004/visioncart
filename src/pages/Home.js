import React, { useContext, useState } from "react";
import products from "../data/products";
import { CartContext } from "../context/CartContext";
import "./Home.css";

const Home = () => {
  const { cartItems, addToCart, increaseQty, decreaseQty } =
    useContext(CartContext);

  const [search, setSearch] = useState("");

  const getQuantity = (id) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  // 🔍 Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">
      <h2>All Products</h2>

      {/* 🔎 Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🛍 Product Grid */}
      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <h3>No products found 😅</h3>
        ) : (
          filteredProducts.map((product) => {
            const qty = getQuantity(product.id);

            return (
              <div className="card" key={product.id}>
                <img src={product.image} alt={product.name} />
                <h4>{product.name}</h4>
                <p>₹{product.price}</p>

                {qty === 0 ? (
                  <button onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                ) : (
                  <div className="qty-controls">
                    <button onClick={() => decreaseQty(product.id)}>
                      -
                    </button>
                    <span>{qty}</span>
                    <button onClick={() => increaseQty(product.id)}>
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;