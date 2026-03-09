import React from "react";
import { useNavigate } from "react-router-dom";

const Timeout = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>⏰ Payment Timeout</h2>
      <p>Your order was not completed.</p>

      <button onClick={() => navigate("/")} style={{
        padding: "10px 20px",
        background: "black",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
      }}>
        Back to Home
      </button>
    </div>
  );
};

export default Timeout;