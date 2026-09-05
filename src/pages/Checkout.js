import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-5px); }
    80%      { transform: translateX(5px); }
  }
  @keyframes labelFloat {
    from { top: 18px; font-size: 1rem; color: #bbb; }
    to   { top: 6px; font-size: 0.72rem; color: var(--orange); }
  }
  @keyframes checkoutPulse {
    0%,100% { box-shadow: 0 8px 24px rgba(255,106,0,0.3); }
    50%      { box-shadow: 0 14px 40px rgba(255,106,0,0.5); }
  }
  @keyframes stepDone {
    from { transform: scale(0); }
    to   { transform: scale(1); }
  }
  @keyframes progressFill {
    from { width: 0; }
    to   { width: 100%; }
  }

  .checkout-page { font-family: 'DM Sans', sans-serif; }

  .page-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: clamp(2rem,5vw,3rem);
    color: #1a1a1a; letter-spacing: -1px;
  }
  .page-sub { color: #888; font-size: 1rem; }

  /* Step indicator */
  .steps {
    display: flex; align-items: center; justify-content: center;
    gap: 0; margin-bottom: 48px;
    animation: fadeUp 0.5s ease both;
  }
  .step {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .step-circle {
    width: 38px; height: 38px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem;
    transition: all 0.3s;
  }
  .step-circle.active {
    background: var(--orange); color: #fff;
    box-shadow: 0 6px 18px rgba(255,106,0,0.35);
  }
  .step-circle.done {
    background: #1a1a1a; color: #fff;
    animation: stepDone 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .step-circle.pending { background: #f0f0f0; color: #bbb; }
  .step-label {
    font-size: 0.72rem; font-weight: 600; color: #aaa;
    text-transform: uppercase; letter-spacing: 0.8px;
  }
  .step-label.active { color: var(--orange); }
  .step-line {
    flex: 1; height: 2px; background: #f0f0f0;
    margin: 0 8px; margin-bottom: 22px; max-width: 60px;
    position: relative; overflow: hidden;
  }
  .step-line.done::after {
    content: ''; position: absolute; inset: 0;
    background: #1a1a1a;
    animation: progressFill 0.4s ease;
  }

  /* Form card */
  .form-card {
    background: #fff;
    border-radius: 24px;
    border: 1.5px solid #f0f0f0;
    padding: 40px;
    animation: slideInLeft 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }
  .form-card-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 1.3rem; color: #1a1a1a; margin-bottom: 28px;
  }

  /* Floating label inputs */
  .field-wrap {
    position: relative; margin-bottom: 24px;
  }
  .field-label {
    position: absolute; left: 18px; top: 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem; color: #bbb; pointer-events: none;
    transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
  }
  .field-input {
    width: 100%; padding: 22px 18px 10px;
    border: 1.5px solid #eee; border-radius: 14px;
    background: #fafafa; color: #1a1a1a;
    font-family: 'DM Sans', sans-serif; font-size: 1rem;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
  }
  .field-input:focus {
    border-color: var(--orange);
    background: #fff;
    box-shadow: 0 0 0 4px var(--orange-glow);
  }
  .field-input:focus + .field-label,
  .field-input.has-value + .field-label {
    top: 7px; font-size: 0.72rem; color: var(--orange); font-weight: 600;
  }
  .field-input.error { border-color: #e74c3c; }
  .field-input.error:focus { box-shadow: 0 0 0 4px rgba(231,76,60,0.12); }

  .error-msg {
    display: flex; align-items: center; gap: 8px;
    background: rgba(231,76,60,0.06);
    border: 1px solid rgba(231,76,60,0.2);
    border-radius: 12px; padding: 12px 16px;
    color: #e74c3c; font-size: 0.88rem; font-weight: 500;
    margin-bottom: 20px;
    animation: shake 0.4s ease;
  }

  .proceed-btn {
    background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
    color: #fff; border: none;
    border-radius: 100px; padding: 16px 32px;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem;
    width: 100%; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    animation: checkoutPulse 2.5s ease-in-out infinite;
  }
  .proceed-btn:hover { transform: scale(1.03); }
  .proceed-btn:active { transform: scale(0.97); }
  .proceed-btn i { transition: transform 0.2s; }
  .proceed-btn:hover i { transform: translateX(5px); }

  /* Summary card */
  .summary-card {
    background: #fff;
    border-radius: 24px;
    border: 1.5px solid #f0f0f0;
    padding: 32px;
    animation: slideInRight 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s both;
    position: sticky; top: 24px;
  }
  .summary-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 1.1rem; color: #1a1a1a; margin-bottom: 20px;
  }

  .order-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid #f5f5f5;
    transition: background 0.2s;
  }
  .order-item:last-child { border-bottom: none; }
  .order-item:hover { background: #fafafa; border-radius: 10px; padding-left: 8px; }

  .order-item-img {
    width: 48px; height: 48px; border-radius: 10px;
    object-fit: cover; flex-shrink: 0;
    border: 1px solid #f0f0f0;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .order-item:hover .order-item-img { transform: scale(1.08); }

  .order-item-name { font-weight: 600; font-size: 0.9rem; color: #1a1a1a; }
  .order-item-qty { font-size: 0.78rem; color: #aaa; }
  .order-item-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.95rem; color: #1a1a1a; }

  .total-row {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 20px; margin-top: 4px;
    border-top: 1.5px dashed #eee;
  }
  .total-label { font-size: 0.88rem; color: #aaa; font-weight: 500; text-transform: uppercase; letter-spacing: 0.8px; }
  .total-amount {
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 1.8rem; color: var(--orange);
  }
`;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const handleProceedToPayment = () => {
    if (!name || !address || !phone) {
      setErrorMsg("Please fill in all required fields.");
      setShakeTrigger(t => t + 1);
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setErrorMsg("Phone number must be exactly 10 digits.");
      setShakeTrigger(t => t + 1);
      return;
    }
    setErrorMsg("");
    sessionStorage.setItem("checkoutData", JSON.stringify({ cartItems, name, address, phone }));
    navigate("/payment", { state: { cartItems, name, address, phone } });
  };

  const totalAmount = cartItems.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);

  return (
    <>
      <style>{STYLES}</style>
      <div className="checkout-page container py-5">

        {/* Header */}
        <div className="text-center mb-4" style={{ animation: "fadeUp 0.5s ease both" }}>
          <h1 className="page-title">Checkout</h1>
          <p className="page-sub">Complete your shipping details to proceed</p>
        </div>

        {/* Steps */}
        <div className="steps">
          <div className="step">
            <div className="step-circle done"><i className="bi bi-check-lg" /></div>
            <span className="step-label">Cart</span>
          </div>
          <div className="step-line done" />
          <div className="step">
            <div className="step-circle active">2</div>
            <span className="step-label active">Shipping</span>
          </div>
          <div className="step-line" />
          <div className="step">
            <div className="step-circle pending">3</div>
            <span className="step-label">Payment</span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-5" style={{ animation: "fadeUp 0.5s ease both" }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🛒</div>
            <h3 style={{ fontFamily: "'Syne'", fontWeight: 700 }}>Your cart is empty</h3>
            <button className="proceed-btn mt-4" style={{ maxWidth: 220, margin: "16px auto 0" }} onClick={() => navigate("/")}>
              Go to Shop
            </button>
          </div>
        ) : (
          <div className="row g-5">

            {/* Form */}
            <div className="col-lg-7">
              <div className="form-card">
                <div className="form-card-title">
                  <i className="bi bi-truck me-2" style={{ color: "var(--orange)" }}></i>
                  Shipping Details
                </div>

                {errorMsg && (
                  <div className="error-msg" key={shakeTrigger}>
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    {errorMsg}
                  </div>
                )}

                {/* Name */}
                <div className="field-wrap">
                  <input
                    type="text"
                    className={`field-input${name ? " has-value" : ""}${errorMsg && !name ? " error" : ""}`}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="off"
                  />
                  <label className="field-label">Full Name</label>
                </div>

                {/* Address */}
                <div className="field-wrap">
                  <input
                    type="text"
                    className={`field-input${address ? " has-value" : ""}${errorMsg && !address ? " error" : ""}`}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    autoComplete="off"
                  />
                  <label className="field-label">Shipping Address</label>
                </div>

                {/* Phone */}
                <div className="field-wrap">
                  <input
                    type="text"
                    className={`field-input${phone ? " has-value" : ""}${errorMsg && !phone ? " error" : ""}`}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoComplete="off"
                    maxLength={10}
                  />
                  <label className="field-label">Phone Number (10 digits)</label>
                </div>

                <button className="proceed-btn" onClick={handleProceedToPayment}>
                  Proceed to Payment <i className="bi bi-arrow-right"></i>
                </button>

                <div style={{
                  marginTop: "20px", display: "flex", gap: "20px",
                  padding: "14px 18px", background: "#fafafa",
                  borderRadius: "12px", border: "1px solid #f0f0f0"
                }}>
                  {["bi-lock-fill", "bi-shield-check", "bi-credit-card-2-front"].map((icon, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <i className={`bi ${icon}`} style={{ color: "var(--orange)", fontSize: "0.9rem" }}></i>
                      <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
                        {["Secure", "Protected", "Encrypted"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="col-lg-5">
              <div className="summary-card">
                <div className="summary-title">Order Summary</div>

                {cartItems.map((item, i) => (
                  <div className="order-item" key={i}>
                    <div style={{ position: "relative" }}>
                      <img src={item.image} alt={item.name} className="order-item-img" />
                      <span style={{
                        position: "absolute", top: -6, right: -6,
                        width: 18, height: 18, borderRadius: "50%",
                        background: "var(--orange)", color: "#fff",
                        fontSize: "0.65rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-qty">₹{item.price} × {item.quantity}</div>
                    </div>
                    <div className="order-item-price">₹{item.price * item.quantity}</div>
                  </div>
                ))}

                <div className="total-row">
                  <span className="total-label">Total</span>
                  <span className="total-amount">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Checkout;