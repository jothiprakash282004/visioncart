// src/pages/Checkout.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleProceedToPayment = () => {
    if (!name || !address || !phone) {
      setErrorMsg("Please enter all required details (Name, Address, and Phone number).");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setErrorMsg("Phone number must be exactly 10 digits long.");
      return;
    }

    setErrorMsg("");

    // Save checkout data
    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({ cartItems, name, address, phone })
    );

    navigate("/payment", { state: { cartItems, name, address, phone } });
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <div className="container py-5">

      <div className="text-center mb-5">
        <h1 className="fw-bold text-gradient display-4">Checkout</h1>
        <p className="text-muted fs-5">Complete your shipping details to proceed</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <h3 className="text-muted">Your cart is empty 🛒</h3>
          <button className="btn btn-premium mt-3" onClick={() => navigate("/")}>
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="row g-5">

          {/* Shipping Form (Left side) */}
          <div className="col-lg-7">
            <div className="premium-card p-4 p-md-5">
              <h4 className="fw-bold mb-4 text-white">Shipping Details</h4>

              {errorMsg && (
                <div className="alert alert-danger py-2 border-0" role="alert" style={{ background: "rgba(220, 53, 69, 0.1)", color: "#ff6b81" }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorMsg}
                </div>
              )}

              <div className="form-floating mb-4">
                <input
                  type="text"
                  className="form-control premium-input border-0 bg-light bg-opacity-50 text-dark"
                  id="floatingName"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
                <label htmlFor="floatingName" className="text-muted">Full Name</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="text"
                  className="form-control premium-input border-0 bg-light bg-opacity-50 text-dark"
                  id="floatingAddress"
                  placeholder="Shipping Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="off"
                />
                <label htmlFor="floatingAddress" className="text-muted">Shipping Address</label>
              </div>

              <div className="form-floating mb-5">
                <input
                  type="text"
                  className="form-control premium-input border-0 bg-light bg-opacity-50 text-dark"
                  id="floatingPhone"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="off"
                />
                <label htmlFor="floatingPhone" className="text-muted">Phone Number</label>
              </div>

              <button
                className="btn btn-premium btn-lg w-100 rounded-pill shadow"
                onClick={handleProceedToPayment}
              >
                Proceed to Payment <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>

          {/* Cart Summary (Right side) */}
          <div className="col-lg-5">
            <div className="premium-card p-4">
              <h4 className="fw-bold mb-4 text-white">Order Summary</h4>

              <div className="d-flex flex-column gap-3 mb-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="position-relative">
                        <img src={item.image} alt={item.name} loading="lazy" className="rounded" style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                          {item.quantity}
                        </span>
                      </div>
                      <span className="fw-semibold ms-2">{item.name}</span>
                    </div>
                    <span className="fw-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <hr className="border-secondary mb-4" />

              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-5 text-muted">Total Amount</span>
                <h3 className="fw-bold text-gradient-success mb-0">₹{totalAmount}</h3>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Checkout;