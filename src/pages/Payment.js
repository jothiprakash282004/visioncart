// src/pages/Payment.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  let { cartItems = [], address = "", phone = "", name = "" } =
    location.state || {};

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

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const [paid, setPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !paid) {
      alert("Order not completed! Redirecting to home page.");
      navigate("/");
    }
  }, [timeLeft, paid, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const merchantUPI = "prakashjoe669@oksbi";
  const merchantName = "jothiprakash natarajan";
  const upiURL = `upi://pay?pa=${merchantUPI}&pn=${merchantName}&am=${totalAmount}&cu=INR&tn=Order+Payment`;

  const handlePaymentDone = async (method) => {
    try {
      const userId = localStorage.getItem("userId") || null;

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          total_amount: totalAmount,
          status: "Paid"
        })
      });

      if (!res.ok) {
        console.error("Failed to save order to database.");
      } else {
        const orderData = await res.json();
        
        await fetch("http://localhost:5000/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderData.id || orderData.order_id || null, // Best effort to extract ID
            user_id: userId,
            amount: totalAmount,
            phone: phone, // Added for SMS notification
            payment_method: method,
            payment_status: "Success",
            transaction_id: `TXN${Math.floor(Math.random()*1000000)}`,
            user_name: name,
            product_name: cartItems.map(item => item.name).join(', ')
          })
        });
      }

      setPaid(true);
      alert(`Payment completed via ${method}`);
      // Clear checkout data from session storage after success
      sessionStorage.removeItem("checkoutData");
      navigate("/success");
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  return (
    <div className="container py-5">

      <div className="text-center mb-5">
        <h1 className="fw-bold text-gradient display-4">Payment</h1>
        <p className="text-muted fs-5">Choose your preferred payment method</p>
      </div>

      <div className="row g-5">
        
        {/* Order Info & Summary */}
        <div className="col-lg-5">
          <div className="premium-card p-4 mb-4">
            <h4 className="fw-bold mb-4 text-white">Shipping Information</h4>
            <div className="text-muted">
              <p className="mb-2"><strong className="text-white">Name:</strong> {name}</p>
              <p className="mb-2"><strong className="text-white">Address:</strong> {address}</p>
              <p className="mb-0"><strong className="text-white">Phone:</strong> {phone}</p>
            </div>
          </div>

          <div className="premium-card p-4">
            <h4 className="fw-bold mb-4 text-white">Order Summary</h4>
            <div className="d-flex flex-column gap-2 mb-4">
              {cartItems.map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                  <span className="text-muted">
                    {item.name} <span className="badge bg-secondary ms-2">x{item.quantity}</span>
                  </span>
                  <span className="fw-semibold text-white">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="d-flex justify-content-between align-items-center mt-3">
               <span className="fs-5 text-muted">Total</span>
               <h3 className="fw-bold text-gradient-success mb-0">₹{totalAmount}</h3>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="col-lg-7">
          <div className="row g-4">
            
            {/* UPI Payment */}
            <div className="col-md-6">
              <div className="premium-card p-4 text-center h-100 d-flex flex-column justify-content-between">
                <div>
                  <h5 className="fw-bold text-white mb-4">Pay via UPI</h5>
                  <div className="p-3 rounded-4 d-inline-block mb-3 shadow" style={{ background: "#ffffff" }}>
                    <QRCodeCanvas value={upiURL} size={180} />
                  </div>
                  <p className="text-muted small mb-4">
                    Scan QR using any UPI app
                  </p>
                </div>
                <button
                  className="btn btn-outline-info w-100 rounded-pill"
                  onClick={() => handlePaymentDone("UPI")}
                >
                  I have paid via UPI
                </button>
              </div>
            </div>

            {/* Card Payment */}
            <div className="col-md-6">
              <div className="premium-card p-4 text-center h-100 d-flex flex-column justify-content-center">
                <i className="bi bi-credit-card justify-content-center mb-3 text-info" style={{ fontSize: "3rem" }}></i>
                <h5 className="fw-bold text-white mb-4">
                  Pay via Card
                </h5>
                <p className="text-muted small mb-4">
                  Secure checkout with Credit or Debit Card
                </p>
                <button
                  className="btn btn-premium w-100 rounded-pill mt-auto"
                  onClick={() => handlePaymentDone("Credit Card")}
                >
                  Pay ₹{totalAmount} via Card
                </button>
              </div>
            </div>

          </div>

          {/* Countdown timer */}
          <div className="mt-5 text-center">
             <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill" style={{ background: "rgba(220, 53, 69, 0.1)", border: "1px solid rgba(220, 53, 69, 0.2)" }}>
               <span className="spinner-grow spinner-grow-sm text-danger" role="status" aria-hidden="true"></span>
               <span className="text-danger fw-semibold">
                 Time left: {formatTime(timeLeft)}
               </span>
             </div>
             <p className="text-muted small mt-2">Transaction will timeout and cancel automatically.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Payment;