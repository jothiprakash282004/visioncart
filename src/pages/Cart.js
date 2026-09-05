import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --orange: #ff6a00;
    --orange-light: #ff8c38;
    --orange-glow: rgba(255,106,0,0.15);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideOutLeft {
    from { opacity: 1; transform: translateX(0) scale(1); max-height: 200px; margin-bottom: 16px; }
    to   { opacity: 0; transform: translateX(-60px) scale(0.96); max-height: 0; margin-bottom: 0; padding: 0; }
  }
  @keyframes counterFlip {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes emptyBounce {
    0%,100% { transform: translateY(0) rotate(-2deg); }
    50%      { transform: translateY(-14px) rotate(2deg); }
  }
  @keyframes totalReveal {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes checkoutPulse {
    0%,100% { box-shadow: 0 8px 24px rgba(255,106,0,0.3); }
    50%      { box-shadow: 0 12px 36px rgba(255,106,0,0.5); }
  }
  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(5); opacity: 0; }
  }
  @keyframes removeShake {
    0%,100% { transform: translateX(0); }
    25%      { transform: translateX(-6px); }
    75%      { transform: translateX(6px); }
  }
  @keyframes toastSlide {
    from { opacity: 0; transform: translateX(110%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(110%); }
  }

  .cart-page { font-family: 'DM Sans', sans-serif; animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }

  .cart-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2rem, 5vw, 3rem); color: #1a1a1a; letter-spacing: -1px;
  }
  .cart-count-badge {
    background: var(--orange-glow); color: var(--orange);
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.85rem;
    padding: 4px 14px; border-radius: 100px; border: 1px solid rgba(255,106,0,0.25);
    display: inline-block; margin-bottom: 12px;
  }

  .cart-item {
    background: #fff; border-radius: 20px; border: 1.5px solid #f0f0f0;
    overflow: hidden;
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    animation: slideInRight 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }
  .cart-item:hover {
    border-color: rgba(255,106,0,0.25);
    box-shadow: 0 12px 32px rgba(0,0,0,0.06);
    transform: translateX(4px);
  }
  .cart-item.removing {
    animation: slideOutLeft 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
    overflow: hidden; pointer-events: none;
  }

  .item-img {
    width: 88px; height: 88px; border-radius: 14px; object-fit: cover;
    border: 1.5px solid #f0f0f0; flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .cart-item:hover .item-img { transform: scale(1.06) rotate(1deg); }

  .item-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem; color: #1a1a1a; }
  .item-price { font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.88rem; color: #888; }
  .item-total { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.15rem; color: var(--orange); }

  .qty-pill {
    display: flex; align-items: center; gap: 10px;
    background: #fff5ee; border: 1.5px solid var(--orange);
    border-radius: 100px; padding: 4px 6px;
  }
  .qty-btn {
    width: 32px; height: 32px; background: var(--orange); color: #fff;
    border: none; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; padding: 0;
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s;
    font-size: 1rem;
  }
  .qty-btn:hover { transform: scale(1.2); background: var(--orange-light); }
  .qty-btn:active { transform: scale(0.9); }
  .qty-num {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem;
    color: var(--orange); min-width: 22px; text-align: center;
    animation: counterFlip 0.22s ease;
  }

  .remove-btn {
    font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.8rem;
    color: #ccc; background: none; border: 1px solid #eee;
    border-radius: 100px; padding: 4px 14px; cursor: pointer; transition: all 0.2s;
  }
  .remove-btn:hover {
    color: #e74c3c; border-color: #e74c3c; background: rgba(231,76,60,0.06);
    animation: removeShake 0.3s ease;
  }

  .summary-card {
    background: #fff; border-radius: 24px; border: 1.5px solid #f0f0f0;
    padding: 36px; position: sticky; top: 24px;
    animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both;
  }
  .summary-label {
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: #aaa;
    font-weight: 500; text-transform: uppercase; letter-spacing: 1px;
  }
  .summary-total {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 2.4rem;
    color: #1a1a1a; line-height: 1; animation: totalReveal 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .summary-total span { color: var(--orange); }

  .checkout-btn {
    background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
    color: #fff; border: none; border-radius: 100px; padding: 16px 36px;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem;
    width: 100%; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    animation: checkoutPulse 2.5s ease-in-out infinite;
    position: relative; overflow: hidden;
  }
  .checkout-btn:hover { transform: scale(1.03); }
  .checkout-btn:active { transform: scale(0.97); }
  .checkout-btn i { transition: transform 0.2s; }
  .checkout-btn:hover i { transform: translateX(4px); }
  .checkout-btn .ripple-el {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.3);
    width: 10px; height: 10px;
    transform: scale(0); animation: ripple 0.6s ease forwards;
    pointer-events: none;
  }

  .continue-btn {
    background: none; border: 1.5px solid #e8e8e8; border-radius: 100px;
    padding: 12px 32px; font-family: 'DM Sans', sans-serif; font-weight: 600;
    font-size: 0.95rem; color: #555; cursor: pointer; width: 100%; margin-top: 12px;
    transition: all 0.2s;
  }
  .continue-btn:hover { border-color: var(--orange); color: var(--orange); background: var(--orange-glow); }
  .continue-btn i { transition: transform 0.2s; }
  .continue-btn:hover i { transform: translateX(-4px); }

  .empty-wrap { text-align: center; padding: 100px 20px; animation: fadeUp 0.6s ease both; }
  .empty-icon-big { font-size: 5rem; display: block; animation: emptyBounce 3s ease-in-out infinite; margin-bottom: 24px; }
  .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.6rem; color: #1a1a1a; }

  .progress-bar-wrap { height: 4px; background: #f0f0f0; border-radius: 100px; overflow: hidden; margin: 16px 0; }
  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--orange), var(--orange-light));
    border-radius: 100px; transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
  }
  .free-shipping-note { font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: #888; text-align: center; margin-top: 8px; }
  .free-shipping-note span { color: var(--orange); font-weight: 600; }

  /* Toast */
  #cart-toast-container {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 9999; display: flex; flex-direction: column; gap: 8px;
    align-items: center; pointer-events: none;
  }
  .cart-toast {
    background: #1a1a1a; color: #fff; border-radius: 100px;
    padding: 10px 22px; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
    animation: toastSlide 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
    pointer-events: all; box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  }
  .cart-toast.out { animation: toastOut 0.3s ease forwards; }
`;

const FREE_SHIPPING_THRESHOLD = 999;

function showCartToast(message, icon = "bi-info-circle") {
  let container = document.getElementById("cart-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "cart-toast-container";
    document.body.appendChild(container);
  }
  const t = document.createElement("div");
  t.className = "cart-toast";
  t.innerHTML = `<i class="bi ${icon}"></i> ${message}`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add("out");
    setTimeout(() => t.remove(), 320);
  }, 2500);
}

function Cart() {
  const { cartItems, removeFromCart, increaseQty, decreaseQty } = useContext(CartContext);
  const navigate = useNavigate();
  const [removingIds, setRemovingIds] = useState(new Set());

  const totalPrice = cartItems.reduce((t, item) => t + item.price * item.quantity, 0);
  const toFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progressPct = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  const handleRemove = (id, name) => {
    setRemovingIds(prev => new Set(prev).add(id));
    showCartToast(`${name} removed`, "bi-trash3");
    setTimeout(() => {
      removeFromCart(id);
      setRemovingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 400);
  };

  const handleCheckout = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "ripple-el";
    span.style.left = `${e.clientX - rect.left - 5}px`;
    span.style.top  = `${e.clientY - rect.top - 5}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 650);
    navigate("/checkout");
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="cart-page container py-5">

        {/* Header */}
        <div className="text-center mb-5" style={{ animation: "fadeUp 0.5s ease both" }}>
          <div className="cart-count-badge">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in cart
          </div>
          <h1 className="cart-title">Your Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-wrap">
            <span className="empty-icon-big">🛒</span>
            <h3 className="empty-title">Your cart is empty</h3>
            <p style={{ color: "#aaa", fontFamily: "'DM Sans'", marginBottom: "28px" }}>
              Looks like you haven't added anything yet
            </p>
            <button className="checkout-btn" style={{ maxWidth: 260, margin: "0 auto" }} onClick={() => navigate("/")}>
              <i className="bi bi-bag"></i> Start Shopping
            </button>
          </div>
        ) : (
          <div className="row g-5">

            {/* Cart Items */}
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`cart-item${removingIds.has(item.id) ? " removing" : ""}`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="p-4 d-flex align-items-center gap-4 flex-wrap">

                      {/* Image */}
                      <img src={item.image} alt={item.name} className="item-img" />

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: "140px" }}>
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">₹{item.price} each</div>
                        {/* Category badge */}
                        {item.category && (
                          <span
                            className="badge mt-1"
                            style={{ background: "rgba(255,106,0,0.1)", color: "var(--orange)", fontSize: "0.72rem" }}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Qty */}
                      <div className="qty-pill">
                        <button className="qty-btn" onClick={() => decreaseQty(item.id)}>
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="qty-num" key={item.quantity}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => increaseQty(item.id)}>
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>

                      {/* Total + remove */}
                      <div className="text-end" style={{ minWidth: "90px" }}>
                        <div className="item-total" key={item.price * item.quantity}>
                          ₹{item.price * item.quantity}
                        </div>
                        <button
                          className="remove-btn mt-2"
                          onClick={() => handleRemove(item.id, item.name)}
                        >
                          <i className="bi bi-trash3 me-1"></i>Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="col-lg-4">
              <div className="summary-card">
                <div className="summary-label mb-2">Order Summary</div>

                <div className="d-flex flex-column gap-2 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="d-flex justify-content-between" style={{ fontSize: "0.9rem", color: "#666" }}>
                      <span style={{ fontFamily: "'DM Sans'" }}>{item.name} × {item.quantity}</span>
                      <span style={{ fontFamily: "'DM Sans'", fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px dashed #eee", paddingTop: "20px", marginBottom: "20px" }}>
                  <div className="summary-label mb-1">Total</div>
                  <div className="summary-total" key={totalPrice}>
                    ₹<span>{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Free shipping progress */}
                {toFreeShipping > 0 ? (
                  <div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="free-shipping-note">
                      Add <span>₹{toFreeShipping}</span> more for free shipping!
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#27ae60", fontSize: "0.82rem", fontFamily: "'DM Sans'", fontWeight: 600, marginBottom: "8px" }}>
                    🎉 You qualify for free shipping!
                  </div>
                )}

                <div style={{ marginTop: "24px" }}>
                  <button className="checkout-btn" onClick={handleCheckout}>
                    Proceed to Checkout <i className="bi bi-arrow-right"></i>
                  </button>
                  <button className="continue-btn" onClick={() => navigate("/")}>
                    <i className="bi bi-arrow-left me-2"></i>Continue Shopping
                  </button>
                </div>

                <div style={{
                  marginTop: "20px", padding: "12px 16px",
                  background: "rgba(255,106,0,0.04)",
                  borderRadius: "12px", border: "1px dashed rgba(255,106,0,0.2)"
                }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <i className="bi bi-shield-check" style={{ color: "var(--orange)", fontSize: "1rem" }}></i>
                    <span style={{ fontFamily: "'DM Sans'", fontSize: "0.8rem", color: "#888" }}>
                      Secure checkout · Encrypted payment
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

export default Cart;