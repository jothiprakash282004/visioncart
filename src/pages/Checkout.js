// src/pages/Checkout.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Checkout = ({ cartItems = [] }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

 const handleProceedToPayment = () => {
  if (!name || !address || !phone) {
    alert("Please enter your Name, Address and Phone number");
    return;
  }

  // ✅ Save checkout data to sessionStorage
  sessionStorage.setItem(
    "checkoutData",
    JSON.stringify({ cartItems, name, address, phone })
  );

  // Navigate with state
  navigate("/payment", { state: { cartItems, name, address, phone } });
};
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        Checkout
      </h1>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "18px" }}>Your cart is empty</p>
      ) : (
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ marginBottom: "15px" }}>Your Cart</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {cartItems.map((item, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 15px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <span>{item.name}</span>
                <span>
                  ₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}
                </span>
              </li>
            ))}
          </ul>

          <h3 style={{ textAlign: "right", marginTop: "10px" }}>Total: ₹{totalAmount}</h3>
        </div>
      )}

      {/* Form for Name, Address, Phone */}
      <div
        style={{
          backgroundColor: "#f7f7f7",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#444" }}>Shipping Details</h2>

        <label style={{ display: "flex", flexDirection: "column", marginBottom: "15px", fontWeight: "500" }}>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            style={{
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "5px",
              fontSize: "16px",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", marginBottom: "15px", fontWeight: "500" }}>
          Address:
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your shipping address"
            style={{
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "5px",
              fontSize: "16px",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", marginBottom: "15px", fontWeight: "500" }}>
          Phone:
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            style={{
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "5px",
              fontSize: "16px",
              outline: "none",
            }}
          />
        </label>

        <button
          onClick={handleProceedToPayment}
          style={{
            padding: "14px 28px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer",
            alignSelf: "flex-end",
            transition: "all 0.3s",
            width: "100%",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default Checkout;