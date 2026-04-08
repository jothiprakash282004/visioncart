import React from "react";
import { useNavigate } from "react-router-dom";

const Timeout = () => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100" style={{ background: "transparent" }}>
      <div className="premium-card p-5 text-center shadow-lg mx-3" style={{ maxWidth: "500px", width: "100%" }}>
        
        <div className="mb-4">
          <i className="bi bi-clock-history text-warning" style={{ fontSize: "4rem" }}></i>
        </div>

        <h2 className="text-warning fw-bold mb-3">
          Payment Timeout
        </h2>

        <p className="text-muted fs-5 mb-5">
          Your payment session has expired. The order was not completed.
        </p>

        <button
          className="btn btn-outline-light btn-lg w-100 rounded-pill shadow"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

      </div>
    </div>
  );
};

export default Timeout;