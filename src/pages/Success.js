// src/pages/Success.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100" style={{ background: "transparent" }}>
      <div className="premium-card p-5 text-center shadow-lg mx-3" style={{ maxWidth: "500px", width: "100%" }}>
        
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
        </div>

        <h2 className="text-gradient-success fw-bold mb-3">
          Payment Successful!
        </h2>

        <p className="text-muted fs-5 mb-5">
          Thank you for your order. It has been placed successfully and will be processed shortly.
        </p>

        <button
          className="btn btn-premium btn-lg w-100 rounded-pill shadow"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

      </div>
    </div>
  );
};

export default Success;