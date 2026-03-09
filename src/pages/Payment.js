// src/pages/Payment.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Try to get data from location.state, fallback to sessionStorage
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

  // Redirect to checkout if still no cart
  

  // Calculate total
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const [paid, setPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Timeout redirect
  useEffect(() => {
    if (timeLeft === 0 && !paid) {
      alert("Order not completed! Redirecting to home page.");
      navigate("/");
    }
  }, [timeLeft, paid, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // UPI QR
  const merchantUPI = "prakashjoe669@oksbi"; // replace with your UPI ID
  const merchantName = "jothiprakash natarajan";
  const upiURL = `upi://pay?pa=${merchantUPI}&pn=${merchantName}&am=${totalAmount}&cu=INR&tn=Order+Payment`;

  const handlePaymentDone = (method) => {
    setPaid(true);
    alert(`Payment completed via ${method}`);
    navigate("/success");
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Payment</h1>

      {/* Shipping Info */}
      <div
        style={{
          backgroundColor: "#f1f1f1",
          padding: "15px 20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Shipping Information</h3>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Address:</strong> {address}</p>
        <p><strong>Phone:</strong> {phone}</p>
      </div>

      {/* Cart Summary */}
      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Order Summary</h2>
        {cartItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #ddd",
            }}
          >
            <span>{item.name} x {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <h3 style={{ textAlign: "right", marginTop: "15px" }}>
          Total: ₹100{totalAmount}
        </h3>
      </div>

      {/* Payment Options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "25px",
        }}
      >
        {/* UPI Payment */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Pay via UPI</h3>
          <QRCodeCanvas value={upiURL} size={200} />
          <p style={{ marginTop: "10px", color: "#555" }}>
            Scan the QR with your UPI app
          </p>
          <button
            onClick={() => handlePaymentDone("UPI")}
            style={{
              marginTop: "15px",
              padding: "12px 20px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              width: "100%",
            }}
          >
            I have paid via UPI
          </button>
        </div>

        {/* Credit/Debit Card Option */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            width: "100%",
            textAlign: "center",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Pay via Credit/Debit Card</h3>
          <button
            onClick={() => handlePaymentDone("Credit Card")}
            style={{
              padding: "12px 20px",
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              width: "100%",
            }}
          >
            Pay ₹{totalAmount} via Card
          </button>
        </div>

        {/* Countdown */}
        <p style={{ color: "#d32f2f" }}>
          Time left: {formatTime(timeLeft)} (Payment will timeout)
        </p>
      </div>
    </div>
  );
};

export default Payment;