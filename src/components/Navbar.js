import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Chatbot from "./Chatbot";
import LogoutModal from "./LogoutModal";

const STYLES = `
  @keyframes navReveal {
    from { opacity: 0; transform: translateY(-100%); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes navItemDrop {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes badgePop {
    0%   { transform: scale(0) rotate(-12deg); }
    60%  { transform: scale(1.25) rotate(4deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  @keyframes cartBounce {
    0%,100% { transform: scale(1) rotate(0deg); }
    25%      { transform: scale(1.35) rotate(-8deg); }
    50%      { transform: scale(0.9) rotate(5deg); }
    75%      { transform: scale(1.15) rotate(-3deg); }
  }
  @keyframes logoWiggle {
    0%,100% { transform: rotate(0deg) scale(1); }
    25%      { transform: rotate(8deg) scale(1.1); }
    75%      { transform: rotate(-5deg) scale(0.95); }
  }

  /* Navbar entrance */
  .navbar {
    animation: navReveal 0.5s cubic-bezier(0.22,1,0.36,1) both !important;
    transition: background 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease !important;
  }

  /* Glass effect when scrolled — toggled via JS */
  .navbar-scrolled {
    background: rgba(255,255,255,0.94) !important;
    backdrop-filter: blur(16px) !important;
    box-shadow: 0 4px 28px rgba(0,0,0,0.07) !important;
  }

  /* Staggered nav items */
  .nav-item-anim {
    animation: navItemDrop 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }
  .nav-item-anim:nth-child(1) { animation-delay: 100ms; }
  .nav-item-anim:nth-child(2) { animation-delay: 175ms; }
  .nav-item-anim:nth-child(3) { animation-delay: 250ms; }
  .nav-item-anim:nth-child(4) { animation-delay: 325ms; }

  /* Cart badge */
  .cart-badge-animated {
    animation: badgePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .cart-bounce { animation: cartBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) !important; }

  /* Logo hover */
  .logo-icon:hover { animation: logoWiggle 0.5s ease; }

  /* Nav button hover lift */
  .nav-btn-hover {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.2s ease,
                border-color 0.2s ease !important;
  }
  .nav-btn-hover:hover {
    transform: translateY(-2px) scale(1.03) !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important;
  }
  .nav-btn-hover:active { transform: scale(0.97) !important; }

  /* Profile link */
  .profile-link-hover {
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1) !important;
  }
  .profile-link-hover:hover {
    background: rgba(255,106,0,0.08) !important;
    border-color: rgba(255,106,0,0.35) !important;
    transform: translateY(-1px);
  }

  /* Sign In button pulse */
  @keyframes signInPulse {
    0%,100% { box-shadow: 0 6px 20px rgba(255,106,0,0.25); }
    50%      { box-shadow: 0 10px 32px rgba(255,106,0,0.45); }
  }
  .btn-premium {
    animation: signInPulse 2.8s ease-in-out infinite;
  }

  /* Mobile menu slide */
  .navbar-collapse.collapsing {
    transition: height 0.3s cubic-bezier(0.22,1,0.36,1) !important;
  }
`;

function Navbar() {
  const { cartItems } = useContext(CartContext);
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const currentUserName = localStorage.getItem("currentUserName") || "User";
  const [showLogout, setShowLogout] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoutConfirm = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUserName");
    localStorage.removeItem("userId");
    setShowLogout(false);
    window.location.href = "/login";
  };

  const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <>
      <style>{STYLES}</style>
      <nav className={`navbar navbar-expand-lg navbar-light sticky-top glass-panel py-2${scrolled ? " navbar-scrolled" : ""}`}>
        <div className="container">

          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <div
              className="logo-icon rounded p-2 d-flex align-items-center justify-content-center"
              style={{ width: "36px", height: "36px", background: "#ff6a00", transition: "transform 0.3s" }}
            >
              <i className="bi bi-lightning-fill text-white fs-5"></i>
            </div>
            <span className="fw-bold fs-4" style={{ color: "#333" }}>
              Fusion<span style={{ color: "#ff6a00" }}>Cart</span>
            </span>
          </Link>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu */}
          <div className="collapse navbar-collapse justify-content-end mt-4 mt-lg-0" id="navbarContent">
            <ul className="navbar-nav align-items-lg-center gap-3 gap-lg-4">

              {location.pathname !== "/" && (
                <li className="nav-item nav-item-anim">
                  <Link
                    className="btn btn-light rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center w-100 nav-btn-hover"
                    style={{ color: "#333", border: "1px solid #e8e8e8" }}
                    to="/"
                  >
                    <i className="bi bi-house-door fs-5 text-secondary"></i>
                    <span>Home</span>
                  </Link>
                </li>
              )}

              {location.pathname !== "/cart" && (
                <li className="nav-item nav-item-anim">
                  <Link
                    className="btn btn-light position-relative rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center w-100 nav-btn-hover"
                    style={{ color: "#333", border: "1px solid #e8e8e8" }}
                    to="/cart"
                  >
                    <i
                      id="navbar-cart-icon"
                      className="bi bi-cart3 fs-5 align-middle"
                      style={{ color: "#ff6a00" }}
                    ></i>
                    <span>Cart</span>
                    {totalItems > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill shadow cart-badge-animated"
                        style={{ background: "#ff6a00", fontSize: "0.75rem", border: "2px solid #fff" }}
                        key={totalItems}
                      >
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </li>
              )}

              <li className="nav-item nav-item-anim">
                <Chatbot />
              </li>

              <li className="nav-item nav-item-anim">
                {isLoggedIn ? (
                  <div className="d-flex align-items-center gap-3">
                    <Link
                      to="/profile"
                      className="d-none d-lg-flex align-items-center gap-2 px-3 py-1 rounded-pill text-decoration-none profile-link-hover"
                      style={{ background: "rgba(255,106,0,0.05)", border: "1px solid rgba(255,106,0,0.2)" }}
                    >
                      <i className="bi bi-person-circle fs-5" style={{ color: "#ff6a00" }}></i>
                      <span className="fw-semibold small" style={{ color: "#333" }}>
                        Hi, {currentUserName.split(" ")[0]}
                      </span>
                    </Link>
                    <button
                      className="btn btn-light rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center nav-btn-hover"
                      style={{ color: "#333", border: "1px solid #e8e8e8" }}
                      onClick={() => setShowLogout(true)}
                    >
                      <i className="bi bi-box-arrow-right fs-5 text-secondary"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    className="btn btn-premium rounded-pill px-4 py-2 shadow-sm fw-semibold d-flex align-items-center gap-2 justify-content-center w-100"
                    to="/login"
                  >
                    <i className="bi bi-person fs-5"></i>
                    <span>Sign In / Register</span>
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
    </>
  );
}

export default Navbar;