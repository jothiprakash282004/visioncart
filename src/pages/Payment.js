import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --orange: #ff6a00; --orange-light: #ff8c38; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes timerPulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.7; transform: scale(0.97); }
  }
  @keyframes qrReveal {
    from { opacity: 0; transform: scale(0.85) rotate(-3deg); }
    to   { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(5); opacity: 0; }
  }
  @keyframes successFlash {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes timerBarShrink {
    from { width: 100%; }
    to   { width: 0%; }
  }

  .payment-page { font-family: 'DM Sans', sans-serif; animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }

  .payment-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2rem,5vw,3rem); color: #1a1a1a; letter-spacing: -1px;
  }

  /* Payment method cards */
  .pay-card {
    background: #fff; border-radius: 20px; border: 1.5px solid #f0f0f0;
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    animation: cardEntrance 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .pay-card:hover {
    border-color: rgba(255,106,0,0.3);
    box-shadow: 0 16px 40px rgba(255,106,0,0.1);
    transform: translateY(-4px);
  }
  .pay-card:nth-child(2) { animation-delay: 0.1s; }

  /* QR code animation */
  .qr-wrap { animation: qrReveal 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }

  /* Pay buttons */
  .pay-btn {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s !important;
    position: relative; overflow: hidden;
  }
  .pay-btn:hover { transform: scale(1.04) translateY(-2px) !important; }
  .pay-btn:active { transform: scale(0.96) !important; }
  .pay-btn .ripple-el {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.3);
    width: 10px; height: 10px; transform: scale(0);
    animation: ripple 0.55s ease forwards; pointer-events: none;
  }

  /* Timer */
  .timer-wrap {
    animation: timerPulse 1.8s ease-in-out infinite;
  }
  .timer-bar-bg {
    height: 4px; background: rgba(220,53,69,0.15);
    border-radius: 100px; overflow: hidden; margin-top: 10px;
  }
  .timer-bar-fill {
    height: 100%; background: #dc3545; border-radius: 100px;
    animation: timerBarShrink 300s linear forwards;
  }

  /* Info card */
  .info-card {
    background: #fff; border-radius: 20px; border: 1.5px solid #f0f0f0;
    animation: cardEntrance 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .info-card:nth-child(2) { animation-delay: 0.08s; }

  /* Success / error inline banner */
  @keyframes bannerPop {
    from { opacity: 0; transform: scale(0.9) translateY(-8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .inline-banner {
    border-radius: 14px; padding: 14px 18px;
    display: flex; align-items: center; gap: 12px;
    font-family: 'DM Sans', sans-serif; font-weight: 600;
    animation: bannerPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
    margin-bottom: 16px;
  }
  .inline-banner.success {
    background: rgba(39,174,96,0.08); border: 1px solid rgba(39,174,96,0.25); color: #27ae60;
  }
  .inline-banner.error {
    background: rgba(220,53,69,0.08); border: 1px solid rgba(220,53,69,0.25); color: #dc3545;
  }
`;

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  let { cartItems = [], address = "", phone = "", name = "" } = location.state || {};
  if (cartItems.length === 0) {
    const savedData = sessionStorage.getItem("checkoutData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      cartItems = parsed.cartItems || [];
      address = parsed.address || "";
      phone = parsed.phone || "";
      name = parsed.name || "";
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const [paid, setPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [processing, setProcessing] = useState(false);
  const [banner, setBanner] = useState(null); // { type, message }

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !paid) {
      navigate("/timeout");
    }
  }, [timeLeft, paid, navigate]);

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const merchantUPI = "prakashjoe669@oksbi";
  const merchantName = "jothiprakash natarajan";
  const upiURL = `upi://pay?pa=${merchantUPI}&pn=${merchantName}&am=${totalAmount}&cu=INR&tn=Order+Payment`;

  const addRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "ripple-el";
    span.style.left = `${e.clientX - rect.left - 5}px`;
    span.style.top  = `${e.clientY - rect.top - 5}px`;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 600);
  };

  const handlePaymentDone = async (e, method) => {
    addRipple(e);
    setProcessing(true);
    setBanner(null);
    try {
      const userId = localStorage.getItem("userId") || null;
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, total_amount: totalAmount, status: "Paid" }),
      });
      if (!res.ok) throw new Error("Order save failed");
      const orderData = await res.json();

      await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderData.id || orderData.order_id || null,
          user_id: userId, amount: totalAmount, phone,
          payment_method: method, payment_status: "Success",
          transaction_id: `TXN${Math.floor(Math.random() * 1000000)}`,
          user_name: name,
          product_name: cartItems.map(item => item.name).join(", "),
        }),
      });

      setPaid(true);
      sessionStorage.removeItem("checkoutData");
      setBanner({ type: "success", message: `Payment via ${method} confirmed! Redirecting...` });
      setTimeout(() => navigate("/success"), 1800);
    } catch {
      setBanner({ type: "error", message: "Payment failed. Please try again." });
    } finally {
      setProcessing(false);
    }
  };

  const urgency = timeLeft < 60;

  return (
    <>
      <style>{STYLES}</style>
      <div className="payment-page container py-5">

        <div className="text-center mb-5" style={{ animation: "fadeUp 0.5s ease both" }}>
          <h1 className="payment-title">Payment</h1>
          <p className="text-muted fs-5" style={{ fontFamily: "'DM Sans'" }}>Choose your preferred payment method</p>
        </div>

        {banner && (
          <div className={`inline-banner ${banner.type}`}>
            <i className={`bi ${banner.type === "success" ? "bi-check-circle-fill fs-5" : "bi-x-circle-fill fs-5"}`}></i>
            {banner.message}
          </div>
        )}

        <div className="row g-5">

          {/* Order Info & Summary */}
          <div className="col-lg-5">
            <div className="info-card p-4 mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontFamily: "'Syne'" }}>
                <i className="bi bi-geo-alt-fill" style={{ color: "var(--orange)" }}></i> Shipping Info
              </h5>
              <div style={{ fontFamily: "'DM Sans'", fontSize: "0.95rem", color: "#555" }}>
                <p className="mb-2"><strong className="text-dark">Name:</strong> {name}</p>
                <p className="mb-2"><strong className="text-dark">Address:</strong> {address}</p>
                <p className="mb-0"><strong className="text-dark">Phone:</strong> {phone}</p>
              </div>
            </div>

            <div className="info-card p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontFamily: "'Syne'" }}>
                <i className="bi bi-bag-check-fill" style={{ color: "var(--orange)" }}></i> Order Summary
              </h5>
              <div className="d-flex flex-column gap-2 mb-3">
                {cartItems.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="text-muted" style={{ fontFamily: "'DM Sans'", fontSize: "0.9rem" }}>
                      {item.name}
                      <span className="badge bg-secondary ms-2" style={{ fontSize: "0.7rem" }}>x{item.quantity}</span>
                    </span>
                    <span className="fw-semibold" style={{ fontFamily: "'Syne'" }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="text-muted">Total</span>
                <h4 className="fw-bold mb-0" style={{ fontFamily: "'Syne'", color: "var(--orange)" }}>₹{totalAmount}</h4>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="col-lg-7">
            <div className="row g-4">

              {/* UPI */}
              <div className="col-md-6">
                <div className="pay-card p-4 text-center h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-3" style={{ fontFamily: "'Syne'" }}>Pay via UPI</h5>
                    <div className="qr-wrap p-3 rounded-4 d-inline-block mb-3 shadow-sm" style={{ background: "#fff", border: "1.5px solid #f0f0f0" }}>
                      <QRCodeCanvas value={upiURL} size={160} />
                    </div>
                    <p className="text-muted small mb-3">Scan with any UPI app</p>
                  </div>
                  <button
                    className="btn btn-outline-info w-100 rounded-pill fw-semibold pay-btn"
                    disabled={processing}
                    onClick={(e) => handlePaymentDone(e, "UPI")}
                  >
                    {processing ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : <i className="bi bi-check-circle me-2"></i>}
                    I have paid via UPI
                  </button>
                </div>
              </div>

              {/* Card */}
              <div className="col-md-6">
                <div className="pay-card p-4 text-center h-100 d-flex flex-column justify-content-center">
                  <i className="bi bi-credit-card-2-front mb-3" style={{ fontSize: "3rem", color: "var(--orange)" }}></i>
                  <h5 className="fw-bold mb-3" style={{ fontFamily: "'Syne'" }}>Pay via Card</h5>
                  <p className="text-muted small mb-4">Secure checkout with Credit or Debit Card</p>
                  <button
                    className="btn btn-primary w-100 rounded-pill fw-semibold mt-auto pay-btn"
                    style={{ background: "linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%)", border: "none" }}
                    disabled={processing}
                    onClick={(e) => handlePaymentDone(e, "Credit Card")}
                  >
                    {processing ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : <i className="bi bi-lock-fill me-2"></i>}
                    Pay ₹{totalAmount} via Card
                  </button>
                </div>
              </div>

            </div>

            {/* Timer */}
            <div className="mt-5 text-center timer-wrap">
              <div
                className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill"
                style={{
                  background: urgency ? "rgba(220,53,69,0.12)" : "rgba(220,53,69,0.07)",
                  border: `1px solid rgba(220,53,69,${urgency ? "0.35" : "0.15"})`,
                  transition: "all 0.5s ease"
                }}
              >
                <span className="spinner-grow spinner-grow-sm text-danger" role="status" aria-hidden="true"></span>
                <span className={`fw-bold ${urgency ? "text-danger fs-5" : "text-danger"}`}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-muted small">remaining</span>
              </div>
              <div className="timer-bar-bg mt-2 mx-auto" style={{ maxWidth: "260px" }}>
                <div className="timer-bar-fill" style={{ animationDuration: "300s" }}></div>
              </div>
              <p className="text-muted small mt-2">Transaction auto-cancels on timeout.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;