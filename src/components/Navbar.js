import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Chatbot from "./Chatbot";
import LogoutModal from "./LogoutModal";

function Navbar() {
  const { cartItems } = useContext(CartContext);

  const location = useLocation();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const currentUserName = localStorage.getItem("currentUserName") || "User";
  const [showLogout, setShowLogout] = useState(false);

  const handleLogoutConfirm = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUserName");
    localStorage.removeItem("userId");
    setShowLogout(false);
    window.location.href = "/login";
  };

  const totalItems = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top glass-panel py-2">
      <div className="container">

        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="rounded p-2 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px", background: "#ff6a00" }}>
            <i className="bi bi-lightning-fill text-white fs-5"></i>
          </div>
          <span className="fw-bold fs-4" style={{ color: "#333" }}>Fusion<span style={{ color: "#ff6a00" }}>Cart</span></span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse justify-content-end mt-4 mt-lg-0" id="navbarContent">
          <ul className="navbar-nav align-items-lg-center gap-3 gap-lg-4">

            {location.pathname !== "/" && (
              <li className="nav-item">
                <Link className="btn btn-light rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center w-100" style={{ color: "#333", border: "1px solid #e8e8e8" }} to="/">
                  <i className="bi bi-house-door fs-5 text-secondary"></i> <span>Home</span>
                </Link>
              </li>
            )}

            {location.pathname !== "/cart" && (
              <li className="nav-item">
                <Link className="btn btn-light position-relative rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center w-100" style={{ color: "#333", border: "1px solid #e8e8e8" }} to="/cart">
                  <i id="navbar-cart-icon" className="bi bi-cart3 fs-5 align-middle" style={{ color: "#ff6a00" }}></i>
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill shadow" style={{ background: "#ff6a00", fontSize: "0.75rem", border: "2px solid #fff" }}>
                      {totalItems}
                    </span>
                  )}
                </Link>
              </li>
            )}

            <Chatbot />

            <li className="nav-item">
              {isLoggedIn ? (
                <div className="d-flex align-items-center gap-3">
                  <Link to="/profile" className="d-none d-lg-flex align-items-center gap-2 px-3 py-1 rounded-pill text-decoration-none transition-all profile-link-hover" style={{ background: "rgba(255, 106, 0, 0.05)", border: "1px solid rgba(255, 106, 0, 0.2)"}}>
                    <i className="bi bi-person-circle fs-5" style={{ color: "#ff6a00" }}></i>
                    <span className="fw-semibold small" style={{ color: "#333" }}>Hi, {currentUserName.split(' ')[0]}</span>
                  </Link>
                  <button
                    className="btn btn-light rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center"
                    style={{ color: "#333", border: "1px solid #e8e8e8" }}
                    onClick={() => setShowLogout(true)}
                  >
                    <i className="bi bi-box-arrow-right fs-5 text-secondary"></i> <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link className="btn btn-premium rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center w-100" to="/login">
                  <i className="bi bi-person fs-5"></i> <span>Sign In / Register</span>
                </Link>
              )}
            </li>

          </ul>
        </div>

      </div>

      <LogoutModal 
        isOpen={showLogout} 
        onClose={() => setShowLogout(false)} 
        onConfirm={handleLogoutConfirm} 
      />
    </nav>
  );
}

export default Navbar;