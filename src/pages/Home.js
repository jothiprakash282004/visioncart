import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import LazyImage from "../components/LazyImage";
const Home = () => {
  const { cartItems, addToCart, increaseQty, decreaseQty } =
    useContext(CartContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        const mappedData = data.map(p => ({
          ...p,
          category: p.category || "General",
          details: "Premium Product",
          image: p.image_url
        }));
        setProducts(mappedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch products", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const searchFilteredProducts = products.filter((product) => {
    const searchString = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchString) ||
      (product.category && product.category.toLowerCase().includes(searchString))
    );
  });

  const categories = ["All", ...new Set(searchFilteredProducts.map((p) => p.category))].filter(Boolean);
  const effectiveCategory = categories.includes(selectedCategory) ? selectedCategory : "All";

  const finalFilteredProducts = searchFilteredProducts.filter((product) =>
    effectiveCategory === "All" || product.category === effectiveCategory
  );

  const getQuantity = (id) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (e, product) => {
    addToCart(product);

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const cartIcon = document.getElementById("navbar-cart-icon");

    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();

      const img = document.createElement("img");
      img.src = product.image;
      img.style.position ="fixed";
      img.style.zIndex = "9999";
      img.style.width = "50px";
      img.style.height = "50px";
      img.style.borderRadius = "50%";
      img.style.objectFit = "cover";
      img.style.left = `${rect.left + rect.width / 2 - 25}px`;
      img.style.top = `${rect.top + rect.height / 2 - 25}px`;
      img.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
      img.style.boxShadow = "0 5px 15px rgba(0,0,0,0.5)";
      img.style.pointerEvents = "none";

      document.body.appendChild(img);
      void img.offsetWidth;

      img.style.left = `${cartRect.left + cartRect.width / 2 - 10}px`;
      img.style.top = `${cartRect.top + cartRect.height / 2 - 10}px`;
      img.style.width = "20px";
      img.style.height = "20px";
      img.style.opacity = "0";
      img.style.transform = "scale(0.3)";

      setTimeout(() => {
        img.remove();
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 400);
      }, 800);
    }
  };

  // Group filtered products by their 'category' property
  const groupedProducts = finalFilteredProducts.reduce((acc, product) => {
    const groupName = product.category || "Other Items";
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(product);
    return acc;
  }, {});

  const renderProductCard = (product) => {
    const qty = getQuantity(product.id);
    return (
      <div className="h-100 w-100">
        <div className="card h-100 premium-card text-white w-100">
          <div
            className="position-relative overflow-hidden"
            style={{ height: "220px" }}
          >
            <LazyImage
              src={product.image}
              alt={product.name}
              className="w-100 h-100"
              imgClassName="card-img-top w-100 h-100"
              imgStyle={{}}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          </div>

          <div className="card-body d-flex flex-column text-center">
            {/* PREMIUM PRODUCT NAME */}
            <h5
              className="card-title fw-semibold mb-2"
              style={{
                color: "#333333",
                letterSpacing: "0.5px",
              }}
            >
              {product.name}
            </h5>

            {/* PREMIUM PRICE STYLE */}
            <p className="fw-bold fs-4 mb-4 text-dark">
              ₹{product.price}
            </p>

            <div className="mt-auto d-flex flex-column gap-2">
              <button 
                className="btn btn-light fw-bold rounded-pill mb-2 w-100"
                style={{ color: "#333", border: "1px solid #e8e8e8" }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                Details
              </button>

              {qty === 0 ? (
                <button
                  className="btn btn-cart-action w-100 rounded-pill py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  <i className="bi bi-cart-plus fs-5"></i>
                  Add to Cart
                </button>
              ) : (
                <div className="d-flex justify-content-center align-items-center gap-3 bg-light rounded-pill py-1 px-2 border" style={{ borderColor: "#ff6a00" }}>
                  <button
                    className="btn btn-sm rounded-circle qty-btn"
                    style={{
                      width: "32px",
                      height: "32px",
                      padding: 0,
                      background: "#ff6a00",
                      color: "white"
                    }}
                    onClick={() => decreaseQty(product.id)}
                  >
                    <i className="bi bi-dash fw-bold"></i>
                  </button>

                  <span className="fw-bold fs-5 px-2" style={{ color: "#333" }}>
                    {qty}
                  </span>

                  <button
                    className="btn btn-sm rounded-circle"
                    style={{
                      width: "32px",
                      height: "32px",
                      padding: 0,
                      background: "#ff6a00",
                      color: "white"
                    }}
                    onClick={() => increaseQty(product.id)}
                  >
                    <i className="bi bi-plus fw-bold"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .horizontal-scroll-container::-webkit-scrollbar {
            height: 8px;
          }
          .horizontal-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1; 
            border-radius: 10px;
          }
          .horizontal-scroll-container::-webkit-scrollbar-thumb {
            background: #888; 
            border-radius: 10px;
          }
          .horizontal-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #555; 
          }
        `}
      </style>
      <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold display-4 mb-3" style={{ color: "#333" }}>
          Ready to Ship Products
        </h1>
        <p className="fs-5" style={{ color: "#666" }}>
          Wholesale prices tailored just for you
        </p>
      </div>

      {/* Search Bar */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-8 col-lg-8 position-relative d-flex shadow-sm rounded-pill overflow-hidden" style={{ background: "#fff", padding: "0" }}>
          <input
            type="text"
            className="form-control form-control-lg border-0 shadow-none px-4"
            placeholder="What are you looking for?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: "20px 0 0 20px" }}
          />
          <button className="btn btn-premium px-5 m-1 rounded-pill" style={{ letterSpacing: "1px" }}>Search</button>
        </div>
      </div>

      {/* Categories */}
      <div className="row justify-content-center mb-5">
        <div className="col-12 d-flex justify-content-center flex-wrap gap-2">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`btn rounded px-4 py-2 fw-semibold shadow-sm`}
              onClick={() => setSelectedCategory(category)}
              style={{
                background: effectiveCategory === category ? "#fff" : "#f0f2f5",
                color: effectiveCategory === category ? "#ff6a00" : "#666",
                border: "1px solid",
                borderColor: effectiveCategory === category ? "#ff6a00" : "#e8e8e8",
                transition: "all 0.2s"
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Product Sections */}
      {!loading && Object.keys(groupedProducts).length === 0 ? (
        <div className="row mb-5">
          <div className="col-12 text-center py-5">
            <h3 className="text-muted">No products found 😅</h3>
            <p>Try adjusting your search</p>
          </div>
        </div>
      ) : (
        Object.entries(groupedProducts).map(([groupName, groupItems]) => (
          <div key={groupName} className="mb-5">
            <div className="d-flex align-items-center gap-3 mb-3">
              <i className={`bi ${groupName === "Mobiles" ? "bi-phone" : "bi-box-seam"} fs-4`} style={{ color: "#ff6a00" }}></i>
              <h4 className="fw-bold mb-0" style={{ color: "#333" }}>Top {groupName}</h4>
            </div>
            
            <div className="row g-4 pb-4 px-2">
              {groupItems.map((product) => (
                <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center">
                  {renderProductCard(product)}
                </div>
              ))}
            </div>
          </div>
        ))
      )}


    </div>
  </>
  );
};

export default Home;