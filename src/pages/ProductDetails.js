import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --orange: #ff6a00;
    --orange-light: #ff8c38;
    --orange-glow: rgba(255,106,0,0.12);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes counterFlip {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes addPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.1); }
    70%  { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  @keyframes imagePan {
    0%,100% { transform: scale(1) translate(0,0); }
    25%      { transform: scale(1.04) translate(-10px,-5px); }
    75%      { transform: scale(1.04) translate(8px,4px); }
  }
  @keyframes badgePop {
    from { opacity: 0; transform: scale(0.7) translateY(-6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes pricePop {
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes addCartPulse {
    0%,100% { box-shadow: 0 8px 24px rgba(255,106,0,0.3); }
    50%      { box-shadow: 0 14px 40px rgba(255,106,0,0.5); }
  }
  @keyframes descReveal {
    from { opacity: 0; max-height: 0; }
    to   { opacity: 1; max-height: 400px; }
  }

  .pd-page { font-family: 'DM Sans', sans-serif; }

  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #eee;
    border-radius: 100px; padding: 10px 22px;
    font-family: 'DM Sans', sans-serif; font-weight: 600;
    font-size: 0.88rem; color: #444; cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    margin-bottom: 32px;
    animation: fadeUp 0.4s ease both;
  }
  .back-btn:hover { border-color: var(--orange); color: var(--orange); transform: translateX(-4px); }
  .back-btn i { transition: transform 0.2s; }
  .back-btn:hover i { transform: translateX(-4px); }

  /* Image panel */
  .img-panel {
    border-radius: 28px;
    overflow: hidden;
    background: #f9f9f9;
    border: 1.5px solid #f0f0f0;
    animation: slideInLeft 0.55s cubic-bezier(0.22,1,0.36,1) both;
    position: relative;
  }
  .img-panel img {
    width: 100%; height: 480px; object-fit: contain;
    padding: 32px;
    transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
  }
  .img-panel:hover img { animation: imagePan 6s ease-in-out infinite; }

  .img-badge {
    position: absolute; top: 20px; right: 20px;
    background: rgba(255,255,255,0.92);
    border: 1px solid #f0f0f0;
    border-radius: 100px; padding: 6px 14px;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.75rem; color: #333;
    backdrop-filter: blur(8px);
    animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
  }

  /* Skeleton image */
  .skeleton-img-panel {
    border-radius: 28px; height: 480px;
    background: linear-gradient(90deg, #f0f0f0 25%, #fafafa 50%, #f0f0f0 75%);
    background-size: 600px 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  /* Info panel */
  .info-panel {
    animation: slideInRight 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s both;
  }

  .brand-badge {
    display: inline-block;
    background: #1a1a1a; color: #fff;
    font-family: 'DM Sans', sans-serif; font-weight: 600;
    font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 5px 16px; border-radius: 6px; margin-bottom: 14px;
    animation: badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
  }

  .product-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: clamp(1.8rem, 4vw, 2.4rem);
    color: #1a1a1a; line-height: 1.1; letter-spacing: -0.5px;
    margin-bottom: 16px;
    animation: fadeUp 0.5s ease 0.2s both;
  }

  .product-price-display {
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 2.4rem;
    color: var(--orange); line-height: 1;
    margin-bottom: 24px;
    animation: pricePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.25s both;
  }

  .desc-card {
    background: #fafafa; border-radius: 18px;
    border: 1.5px solid #f0f0f0; padding: 24px;
    margin-bottom: 20px;
    animation: fadeUp 0.5s ease 0.3s both;
  }
  .desc-label {
    font-family: 'DM Sans', sans-serif; font-weight: 700;
    font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase;
    color: #aaa; margin-bottom: 10px;
  }
  .desc-text {
    font-family: 'DM Sans', sans-serif; color: #555;
    font-size: 0.95rem; line-height: 1.75; text-align: justify;
  }

  .location-row {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px; background: #fafafa;
    border-radius: 14px; border: 1.5px solid #f0f0f0;
    margin-bottom: 28px;
    animation: fadeUp 0.5s ease 0.35s both;
    transition: border-color 0.2s;
  }
  .location-row:hover { border-color: rgba(255,106,0,0.3); }
  .location-text { font-family: 'DM Sans'; font-size: 0.9rem; color: #888; }
  .location-text strong { color: #1a1a1a; font-weight: 700; }

  /* CTA */
  .add-cart-btn {
    background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
    color: #fff; border: none; border-radius: 100px;
    padding: 18px 32px; width: 100%;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem;
    display: flex; align-items: center; justify-content: center; gap: 12px;
    cursor: pointer;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    animation: addCartPulse 2.5s ease-in-out infinite, fadeUp 0.5s ease 0.4s both;
  }
  .add-cart-btn:hover { transform: scale(1.03); }
  .add-cart-btn:active { transform: scale(0.97); }
  .add-cart-btn.popped { animation: addPop 0.4s ease; }

  .qty-row {
    display: flex; align-items: center; justify-content: space-between;
    background: #fff5ee; border: 1.5px solid var(--orange);
    border-radius: 100px; padding: 6px 8px;
    animation: fadeUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
    max-width: 320px;
  }
  .qty-btn-lg {
    width: 50px; height: 50px; border-radius: 50%;
    background: var(--orange); color: #fff; border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s;
  }
  .qty-btn-lg:hover { transform: scale(1.18); background: var(--orange-light); }
  .qty-btn-lg:active { transform: scale(0.9); }
  .qty-display {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.4rem; color: var(--orange);
    animation: counterFlip 0.22s ease;
    text-align: center; min-width: 40px;
  }
  .in-cart-label {
    font-family: 'DM Sans'; font-size: 0.75rem; color: #aaa; display: block; margin-top: 2px;
  }

  /* Error / Loading */
  .error-wrap {
    text-align: center; padding: 80px 20px;
    animation: fadeUp 0.5s ease both;
  }
`;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addPopped, setAddPopped] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const getQuantity = (id) => (cartItems.find(i => i.id === id)?.quantity ?? 0);
  const qty = product ? getQuantity(product.id) : 0;

  const handleAddToCart = (e, product) => {
    addToCart({ ...product, image: product.image_url });
    setAddPopped(true);
    setTimeout(() => setAddPopped(false), 400);

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const cartIcon = document.getElementById("navbar-cart-icon");
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      const img = document.createElement("img");
      img.src = product.image_url;
      Object.assign(img.style, {
        position: "fixed", zIndex: "9999",
        width: "50px", height: "50px",
        borderRadius: "50%", objectFit: "cover",
        left: `${rect.left + rect.width / 2 - 25}px`,
        top: `${rect.top + rect.height / 2 - 25}px`,
        transition: "all 0.8s cubic-bezier(0.25,1,0.5,1)",
        boxShadow: "0 5px 15px rgba(0,0,0,0.4)",
        pointerEvents: "none",
      });
      document.body.appendChild(img);
      void img.offsetWidth;
      Object.assign(img.style, {
        left: `${cartRect.left + cartRect.width / 2 - 10}px`,
        top: `${cartRect.top + cartRect.height / 2 - 10}px`,
        width: "20px", height: "20px",
        opacity: "0", transform: "scale(0.3)",
      });
      setTimeout(() => {
        img.remove();
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 500);
      }, 800);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="pd-page container py-5">

        <button className="back-btn" onClick={() => navigate("/")}>
          <i className="bi bi-arrow-left"></i> Back to Products
        </button>

        {loading && (
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="skeleton-img-panel" />
            </div>
            <div className="col-lg-6">
              {[80, 50, 35, 90, 60].map((w, i) => (
                <div key={i} style={{
                  height: i === 0 ? 18 : i === 1 ? 44 : 14,
                  width: `${w}%`, borderRadius: 10, marginBottom: 16,
                  background: "linear-gradient(90deg,#f0f0f0 25%,#fafafa 50%,#f0f0f0 75%)",
                  backgroundSize: "600px 100%",
                  animation: "shimmer 1.5s ease-in-out infinite"
                }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-wrap">
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>😵</div>
            <h3 style={{ fontFamily: "'Syne'", fontWeight: 700 }}>Product not found</h3>
            <p style={{ color: "#aaa" }}>{error}</p>
            <button className="add-cart-btn" style={{ maxWidth: 200, margin: "16px auto" }} onClick={() => navigate("/")}>
              Go Home
            </button>
          </div>
        )}

        {!loading && product && (
          <div className="row g-5 align-items-start">

            {/* Image */}
            <div className="col-lg-6">
              <div className="img-panel">
                <img src={product.image_url} alt={product.name} />
                <div className="img-badge">
                  <i className="bi bi-check-circle-fill me-1" style={{ color: "var(--orange)" }}></i>
                  In Stock
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="col-lg-6 info-panel">
              {product.brand && <div className="brand-badge">{product.brand}</div>}
              <h1 className="product-title">{product.name}</h1>
              <div className="product-price-display">₹{Number(product.price).toLocaleString("en-IN")}</div>

              <div className="desc-card">
                <div className="desc-label">Description</div>
                <p className="desc-text mb-0">
                  {product.description || "A premium quality product brought to you exclusively by SmartCart. Discover the perfect blend of style, functionality, and performance."}
                </p>
              </div>

              {product.address && (
                <div className="location-row">
                  <i className="bi bi-geo-alt-fill" style={{ color: "var(--orange)", fontSize: "1.1rem" }}></i>
                  <span className="location-text">
                    Ships from <strong>{product.address}</strong>
                  </span>
                </div>
              )}

              {qty === 0 ? (
                <button
                  className={`add-cart-btn${addPopped ? " popped" : ""}`}
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  <i className="bi bi-cart-plus-fill" style={{ fontSize: "1.2rem" }}></i>
                  Add to Cart
                </button>
              ) : (
                <div className="qty-row">
                  <button className="qty-btn-lg" onClick={() => decreaseQty(product.id)}>
                    <i className="bi bi-dash"></i>
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <div className="qty-display" key={qty}>{qty}</div>
                    <span className="in-cart-label">in cart</span>
                  </div>
                  <button className="qty-btn-lg" onClick={() => increaseQty(product.id)}>
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              )}

              {/* Trust row */}
              <div style={{
                display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap"
              }}>
                {[
                  { icon: "bi-truck", text: "Fast Delivery" },
                  { icon: "bi-shield-check", text: "Authentic" },
                  { icon: "bi-arrow-counterclockwise", text: "Easy Returns" },
                ].map((t, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", background: "#fafafa",
                    borderRadius: "100px", border: "1.5px solid #f0f0f0",
                    animation: `fadeUp 0.4s ease ${0.45 + i * 0.06}s both`
                  }}>
                    <i className={`bi ${t.icon}`} style={{ color: "var(--orange)", fontSize: "0.85rem" }}></i>
                    <span style={{ fontFamily: "'DM Sans'", fontSize: "0.78rem", fontWeight: 600, color: "#555" }}>
                      {t.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetails;