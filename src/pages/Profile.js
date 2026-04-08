import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../components/LogoutModal";

const Profile = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const currentUserName = localStorage.getItem("currentUserName") || "User";

  
  const handleLogoutConfirm = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUserName");
    localStorage.removeItem("currentUserEmail");
    setShowLogout(false);
    navigate("/login");
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow border-0 rounded-4 premium-card text-white">
            <div className="card-body p-4 p-md-5 text-center">
              
              <div className="mb-4 d-inline-block p-4 rounded-circle" style={{ background: "rgba(255, 255, 255, 0.1)", border: "2px solid rgba(255, 255, 255, 0.2)" }}>
                <i className="bi bi-person-circle display-1 text-warning"></i>
              </div>
              
              <h2 className="text-black fw-bold mb-4">{currentUserName === "Admin" ? "Admin Profile" : currentUserName}</h2>
              
              
              <hr className="bg-secondary opacity-50 mb-4" />
              
              <div className="d-grid gap-3">
                <Link to="/" className="btn btn-outline-info rounded-pill py-2 fw-semibold d-flex justify-content-center align-items-center gap-2">
                  <i className="bi bi-house-door"></i> Back to Home
                </Link>
                
                <button 
                  className="btn btn-danger rounded-pill py-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
                  onClick={() => setShowLogout(true)}
                >
                  <i className="bi bi-box-arrow-right"></i> Logout
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <LogoutModal 
        isOpen={showLogout} 
        onClose={() => setShowLogout(false)} 
        onConfirm={handleLogoutConfirm} 
      />
    </div>
  );
};

export default Profile;
