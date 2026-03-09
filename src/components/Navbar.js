import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Navbar() {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  // Total quantity (professional version)
  const totalItems = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <div
      style={{
        background: "rgba(15,15,30,0.8)",
        backdropFilter: "blur(12px)",
        padding: "18px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h2
        style={{
          margin: 0,
          color: "#00f5ff",
          letterSpacing: "1px",
        }}
      >
        ⚡ SmartCart
      </h2>

      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "16px",
          }}
        >
          Home
        </Link>

        <Link
          to="/cart"
          style={{
            color: "#00f5ff",
            textDecoration: "none",
            fontSize: "16px",
          }}
        >
          Cart ({totalItems})
        </Link>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid #ff4d4d",
              color: "#ff4d4d",
              padding: "6px 14px",
              borderRadius: "20px",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            style={{
              border: "1px solid #00f5ff",
              padding: "6px 14px",
              borderRadius: "20px",
              textDecoration: "none",
              color: "#00f5ff",
            }}
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;