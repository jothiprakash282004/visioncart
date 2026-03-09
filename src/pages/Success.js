// src/pages/Success.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Payment Successful!</h2>
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Back to Home
      </button>
    </div>
  );
};

export default Success;