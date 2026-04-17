import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useChatbot } from "../context/ChatbotContext";
import { useNavigate } from "react-router-dom";
import LazyImage from "../components/LazyImage";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --orange: #ff6a00;
    --orange-light: #ff8c38;
    --orange-glow: rgba(255,106,0,0.18);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes cartBounce {
    0%,100% { transform: scale(1) rotate(0deg); }
    25%      { transform: scale(1.35) rotate(-8deg); }
    50%      { transform: scale(0.9) rotate(5deg); }
    75%      { transform: scale(1.15) rotate(-3deg); }
  }
  @keyframes categoryPop {
    from { opacity: 0; transform: scale(0.75) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes counterFlip {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes heroFloat {
    0%,100% { transform: translateY(0px) rotate(-1deg); }
    50%      { transform: translateY(-10px) rotate(1deg); }
  }
  @keyframes searchGlow {
    0%,100% { box-shadow: 0 0 0 0 var(--orange-glow); }
    50%      { box-shadow: 0 0 0 8px var(--orange-glow); }
  }
  @keyframes sectionReveal {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes addedPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.18); }
    70%  { transform: scale(0.93); }
    100% { transform: scale(1); }
  }
  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes badgeBounce {
    0%   { transform: scale(0) rotate(-10deg); }
    60%  { transform: scale(1.2) rotate(4deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  @keyframes toastSlide {
    from { opacity: 0; transform: translateX(110%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to   { opacity: 0; transform: translateX(110%) scale(0.9); }
  }

  .fade-up  { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .scale-in { animation: scaleIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-in  { animation: fadeIn 0.4s ease both; }

  /* ── Hero ── */
  .hero-badge {
    display: inline-block;
    background: var(--orange-glow);
    color: var(--orange);
    font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 13px;
    letter-spacing: 1.5px; text-transform: uppercase;
    padding: 6px 18px; border-radius: 100px;
    border: 1px solid rgba(255,106,0,0.25);
    margin-bottom: 16px;
  }
  .hero-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    color: #1a1a1a; line-height: 1.1; letter-spacing: -1px;
  }
  .hero-sub {
    font-family: 'DM Sans', sans-serif; font-size: 1.1rem;
    color: #666; font-weight: 400;
  }

  /* ── Search ── */
  .search-wrap {
    position: relative; background: #fff;
    border-radius: 100px; border: 1.5px solid #e8e8e8;
    overflow: hidden; transition: border-color 0.3s, box-shadow 0.3s;
    display: flex; align-items: stretch;
  }
  .search-wrap:focus-within {
    border-color: var(--orange);
    animation: searchGlow 2s ease-in-out infinite;
  }
  .search-input {
    border: none !important; outline: none !important;
    background: transparent; font-family: 'DM Sans', sans-serif;
    font-size: 1rem; color: #333; padding: 0 24px; flex: 1;
    box-shadow: none !important;
  }
  .search-btn {
    background: var(--orange); color: #fff; border: none;
    border-radius: 100px; padding: 12px 32px;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem;
    margin: 5px; cursor: pointer; transition: background 0.2s, transform 0.15s;
    position: relative; overflow: hidden;
  }
  .search-btn:hover { background: var(--orange-light); transform: scale(1.03); }
  .search-btn:active { transform: scale(0.97); }

  /* ── Category buttons ── */
  .cat-btn {
    font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.88rem;
    padding: 8px 20px; border-radius: 100px; border: 1.5px solid #e8e8e8;
    background: #f7f7f7; color: #666; cursor: pointer;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    animation: categoryPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .cat-btn:hover { transform: translateY(-2px) scale(1.04); border-color: var(--orange); color: var(--orange); }
  .cat-btn.active {
    background: var(--orange); color: #fff; border-color: var(--orange);
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 6px 20px rgba(255,106,0,0.3);
  }

  /* ── Product cards ── */
  .product-card-wrap {
    opacity: 0;
    animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .product-card {
    border-radius: 20px !important; border: 1.5px solid #f0f0f0 !important;
    background: #fff !important; overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s !important;
    cursor: pointer;
  }
  .product-card:hover {
    transform: translateY(-10px) scale(1.02) !important;
    box-shadow: 0 24px 48px rgba(255,106,0,0.12), 0 8px 24px rgba(0,0,0,0.06) !important;
    border-color: rgba(255,106,0,0.3) !important;
  }
  .product-img-wrap {
    position: relative; overflow: hidden; height: 220px; background: #fafafa;
  }
  .product-img-wrap img {
    transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1) !important;
    width: 100%; height: 100%; object-fit: cover;
  }
  .product-card:hover .product-img-wrap img { transform: scale(1.08) !important; }
  .img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.08), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .product-card:hover .img-overlay { opacity: 1; }

  /* Quick-view chip that appears on hover */
  .quick-chip {
    position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%) translateY(10px);
    background: rgba(255,255,255,0.95); backdrop-filter: blur(8px);
    border-radius: 100px; padding: 5px 16px;
    font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 600; color: var(--orange);
    white-space: nowrap; opacity: 0;
    transition: opacity 0.25s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events: none;
    border: 1px solid rgba(255,106,0,0.2);
  }
  .product-card:hover .quick-chip { opacity: 1; transform: translateX(-50%) translateY(0); }

  .product-name {
    font-family: 'DM Sans', sans-serif; font-weight: 600;
    font-size: 0.95rem; color: #222; letter-spacing: 0.2px;
  }
  .product-price {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.3rem; color: #1a1a1a;
  }

  .btn-details {
    font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.85rem;
    color: #555; background: #f5f5f5; border: 1px solid #eee;
    border-radius: 100px; padding: 7px 18px;
    transition: all 0.2s; cursor: pointer;
  }
  .btn-details:hover { background: #eee; color: #333; transform: scale(1.02); }

  .btn-add-cart {
    font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.9rem;
    color: #fff; background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
    border: none; border-radius: 100px; padding: 10px 18px;
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s;
    position: relative; overflow: hidden;
  }
  .btn-add-cart::after {
    content: ''; position: absolute; inset: 0;
    background: rgba(255,255,255,0.15); opacity: 0; transition: opacity 0.2s;
  }
  .btn-add-cart:hover { transform: scale(1.04); box-shadow: 0 8px 20px rgba(255,106,0,0.35); }
  .btn-add-cart:hover::after { opacity: 1; }
  .btn-add-cart:active { transform: scale(0.97); }
  .btn-add-cart.added { animation: addedPop 0.4s ease; }

  /* Ripple on btn-add-cart click */
  .btn-add-cart .ripple-span {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.35);
    width: 10px; height: 10px;
    transform: scale(0); animation: ripple 0.55s ease forwards;
    pointer-events: none;
  }

  /* ── Qty pill ── */
  .qty-pill {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    background: #fff5ee; border: 1.5px solid var(--orange);
    border-radius: 100px; padding: 4px 8px;
    animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .qty-btn {
    width: 34px; height: 34px; background: var(--orange); color: #fff;
    border: none; border-radius: 50%; font-size: 1.1rem;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s;
    padding: 0;
  }
  .qty-btn:hover { transform: scale(1.18); background: var(--orange-light); }
  .qty-btn:active { transform: scale(0.9); }
  .qty-num {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem;
    color: var(--orange); min-width: 24px; text-align: center;
    animation: counterFlip 0.25s ease;
  }

  /* ── Section header ── */
  .section-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
    animation: sectionReveal 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .section-icon {
    width: 42px; height: 42px; background: var(--orange-glow);
    border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
  }
  .section-title-text {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.35rem; color: #1a1a1a;
  }
  .section-divider { flex: 1; height: 1px; background: linear-gradient(to right, #f0f0f0, transparent); }

  /* ── Skeleton ── */
  .skeleton-card { border-radius: 20px; overflow: hidden; background: #fff; border: 1.5px solid #f0f0f0; }
  .skeleton-img {
    height: 220px;
    background: linear-gradient(90deg, #f0f0f0 25%, #fafafa 50%, #f0f0f0 75%);
    background-size: 600px 100%; animation: shimmer 1.5s ease-in-out infinite;
  }
  .skeleton-line {
    height: 14px; border-radius: 8px;
    background: linear-gradient(90deg, #f0f0f0 25%, #fafafa 50%, #f0f0f0 75%);
    background-size: 600px 100%; animation: shimmer 1.5s ease-in-out infinite;
    margin-bottom: 10px;
  }

  /* ── Empty state ── */
  .empty-state { text-align: center; padding: 80px 20px; animation: fadeUp 0.6s ease both; }
  .empty-icon { font-size: 4rem; display: block; animation: heroFloat 3s ease-in-out infinite; margin-bottom: 20px; }

  /* ── Toast ── */
  #home-toast-container {
    position: fixed; top: 85px; right: 18px; z-index: 9999;
    display: flex; flex-direction: column; gap: 10px; pointer-events: none;
  }
  .home-toast {
    display: flex; align-items: center; gap: 10px;
    background: #fff; border-radius: 14px; border: 1.5px solid #f0f0f0;
    padding: 12px 16px; min-width: 240px; max-width: 320px;
    box-shadow: 0 14px 36px rgba(0,0,0,0.11);
    pointer-events: all; cursor: pointer;
    animation: toastSlide 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500; color: #333;
    position: relative; overflow: hidden;
  }
  .home-toast.hiding { animation: toastOut 0.35s ease forwards; }
  .home-toast-bar {
    position: absolute; bottom: 0; left: 0; height: 3px;
    background: var(--orange); border-radius: 0 0 14px 14px;
    animation: toastBar 3s linear forwards;
  }
  @keyframes toastBar { from { width: 100%; } to { width: 0%; } }

  /* ── Navbar badge pop ── */
  .cart-bounce { animation: cartBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) !important; }

  /* ── Navbar scroll glass ── */
  .navbar-scrolled {
    background: rgba(255,255,255,0.94) !important;
    backdrop-filter: blur(14px) !important;
    box-shadow: 0 4px 24px rgba(0,0,0,0.07) !important;
  }

  .horizontal-scroll-container::-webkit-scrollbar { height: 6px; }
  .horizontal-scroll-container::-webkit-scrollbar-track { background: #f5f5f5; border-radius: 10px; }
  .horizontal-scroll-container::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
  .horizontal-scroll-container::-webkit-scrollbar-thumb:hover { background: var(--orange); }
`;

/* ── Toast helper ── */
function showToast(message, type = "success") {
  let container = document.getElementById("home-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "home-toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  const icon = type === "success"
    ? `<i class="bi bi-bag-check-fill text-success fs-5"></i>`
    : `<i class="bi bi-x-circle-fill text-danger fs-5"></i>`;
  toast.className = "home-toast";
  toast.innerHTML = `${icon}<span style="flex:1">${message}</span><div class="home-toast-bar"></div>`;
  toast.onclick = () => {
    toast.classList.add("hiding");
    setTimeout(() => toast.remove(), 380);
  };
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => toast.remove(), 380);
  }, 3200);
}

/* ── Skeleton loader ── */
const SkeletonCard = () => (
  <div className="col-12 col-sm-6 col-md-4 col-lg-3">
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="p-3">
        <div className="skeleton-line" style={{ width: "70%" }} />
        <div className="skeleton-line" style={{ width: "40%" }} />
        <div className="skeleton-line" style={{ width: "55%", height: "36px", borderRadius: "100px", marginTop: "12px" }} />
      </div>
    </div>
  </div>
);

const Home = () => {
  const { cartItems, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  const { isChatbotOpen } = useChatbot();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());
  

  /* Navbar glass on scroll */
  useEffect(() => {
    const navbar = document.querySelector(".navbar");
    const onScroll = () => {
      if (!navbar) return;
      navbar.classList.toggle("navbar-scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const searchFilteredProducts = products.filter((p) => {
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || (p.category && p.category.toLowerCase().includes(s));
  });

  const categories = ["All", ...new Set(searchFilteredProducts.map((p) => p.category))].filter(Boolean);
  const effectiveCategory = categories.includes(selectedCategory) ? selectedCategory : "All";
  const finalFiltered = searchFilteredProducts.filter(
    (p) => effectiveCategory === "All" || p.category === effectiveCategory
  );

  const getQuantity = (id) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (e, product) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`);

    /* ripple on button */
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "ripple-span";
    span.style.left = `${e.clientX - rect.left - 5}px`;
    span.style.top  = `${e.clientY - rect.top - 5}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 600);

    /* fly-to-cart */
    const cartIcon = document.getElementById("navbar-cart-icon");
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      const img = document.createElement("img");
      img.src = product.image;
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

    setAddedIds(prev => new Set(prev).add(product.id));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; }), 400);
  };

  const groupedProducts = finalFiltered.reduce((acc, product) => {
    const g = product.category || "Other Items";
    if (!acc[g]) acc[g] = [];
    acc[g].push(product);
    return acc;
  }, {});

  const renderProductCard = (product, cardIndex) => {
    const qty = getQuantity(product.id);
    const isAdded = addedIds.has(product.id);
    const delay = Math.min(cardIndex * 60, 400);

    return (
      <div
        className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center product-card-wrap"
        style={{ 
          animationDelay: `${delay}ms`,
          zIndex: isChatbotOpen ? 200 : 'auto'
        }}
        key={product.id}
      >
        <div className="w-100">
          <div className="card h-100 product-card">
            <div className="product-img-wrap">
              <LazyImage
                src={product.image}
                alt={product.name}
                className="w-100 h-100"
                imgClassName="w-100 h-100"
                imgStyle={{ objectFit: "cover" }}
              />
              <div className="img-overlay" />
              <div className="quick-chip">
                <i className="bi bi-eye me-1"></i> Quick View
              </div>
            </div>

            <div className="card-body d-flex flex-column text-center p-3">
              <div className="product-name mb-1">{product.name}</div>
              <div className="product-price mb-3">₹{product.price}</div>

              <div className="mt-auto d-flex flex-column gap-2">
                <button
                  className="btn-details w-100"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <i className="bi bi-eye me-1"></i> View Details
                </button>

                {qty === 0 ? (
                  <button
                    className={`btn-add-cart${isAdded ? " added" : ""}`}
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <i className="bi bi-cart-plus-fill" style={{ fontSize: "1rem" }}></i>
                    Add to Cart
                  </button>
                ) : (
                  <div className="qty-pill">
                    <button className="qty-btn" onClick={() => decreaseQty(product.id)}>
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className="qty-num" key={qty}>{qty}</span>
                    <button className="qty-btn" onClick={() => increaseQty(product.id)}>
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="container py-5">
        {/* ── Hero ── */}
        <div className="text-center mb-5">
          <div className="hero-badge fade-in" style={{ animationDelay: "0ms" }}>
            ✦ Wholesale Prices
          </div>
          <h1 className="hero-title fade-up" style={{ animationDelay: "80ms" }}>
            Ready to Ship <br />
            <span style={{ color: "var(--orange)" }}>Products</span>
          </h1>
          <p className="hero-sub fade-up mt-3" style={{ animationDelay: "160ms" }}>
            Tailored just for you — browse, add, checkout in seconds
          </p>

          {/* Stats row */}
          <div
            className="d-inline-flex gap-4 mt-4 px-4 py-2 rounded-pill fade-up"
            style={{
              background: "#f7f7f7", border: "1px solid #eee",
              animationDelay: "240ms"
            }}
          >
            {[
              { icon: "bi-box-seam", label: "Products", value: products.length || "50+" },
              { icon: "bi-truck",    label: "Fast Delivery", value: "Free" },
              { icon: "bi-shield-check", label: "Secure", value: "100%" },
            ].map((s, i) => (
              <div key={i} className="d-flex align-items-center gap-2">
                <i className={`bi ${s.icon}`} style={{ color: "var(--orange)" }}></i>
                <span style={{ fontFamily: "'DM Sans'", fontSize: "0.82rem", color: "#555" }}>
                  <strong style={{ color: "#1a1a1a" }}>{s.value}</strong> {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search ── */}
        <div className="row justify-content-center mb-5 fade-up" style={{ animationDelay: "280ms" }}>
          <div className="col-md-8 col-lg-7">
            <div className="search-wrap">
              <i className="bi bi-search ms-3" style={{ color: "#aaa" }}></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search products or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-btn">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* ── Categories ── */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`cat-btn${effectiveCategory === cat ? " active" : ""}`}
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Loading Skeletons ── */}
        {loading && (
          <div className="row g-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && Object.keys(groupedProducts).length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#1a1a1a" }}>
              Nothing found
            </h3>
            <p style={{ color: "#888" }}>Try a different search or category</p>
          </div>
        )}

        {/* ── Product Sections ── */}
        {!loading &&
          Object.entries(groupedProducts).map(([groupName, groupItems]) => (
            <div key={groupName} className="mb-5">
              <div className="section-header">
                <div className="section-icon">
                  <i
                    className={`bi ${groupName === "Mobiles" ? "bi-phone" : "bi-box-seam"}`}
                    style={{ color: "var(--orange)" }}
                  />
                </div>
                <span className="section-title-text">Top {groupName}</span>
                <div className="section-divider" />
                <span style={{ fontFamily: "'DM Sans'", fontSize: "0.82rem", color: "#aaa", whiteSpace: "nowrap" }}>
                  {groupItems.length} items
                </span>
              </div>

              <div className="row g-4">
                {groupItems.map((product, idx) => renderProductCard(product, idx))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Home;