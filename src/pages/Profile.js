import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../components/LogoutModal";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --orange: #ff6a00; --orange-light: #ff8c38; --orange-glow: rgba(255,106,0,0.12); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes avatarFloat {
    0%,100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-8px) scale(1.03); }
  }
  @keyframes ringRotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(20px,-15px); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(-15px,20px); }
  }

  .profile-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 40px 16px;
    font-family: 'DM Sans', sans-serif;
    position: relative; overflow: hidden;
    background: #fafafa;
  }
  .orb {
    position: absolute; border-radius: 50%;
    filter: blur(70px); pointer-events: none;
  }
  .orb-1 { width: 320px; height: 320px; background: rgba(255,106,0,0.08); top: -80px; right: -60px; animation: orb1 9s ease-in-out infinite; }
  .orb-2 { width: 260px; height: 260px; background: rgba(255,140,56,0.06); bottom: -60px; left: -40px; animation: orb2 11s ease-in-out infinite; }

  .profile-card {
    background: #fff; border-radius: 32px;
    border: 1.5px solid #f0f0f0;
    padding: 52px 44px; width: 100%; max-width: 460px;
    position: relative; z-index: 1;
    box-shadow: 0 32px 80px rgba(0,0,0,0.05);
    animation: scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  /* Avatar */
  .avatar-wrap {
    display: flex; flex-direction: column; align-items: center; margin-bottom: 28px;
  }
  .avatar-ring {
    width: 110px; height: 110px; border-radius: 50%;
    background: conic-gradient(var(--orange) 0deg, var(--orange-light) 120deg, #f0f0f0 180deg, #f0f0f0 360deg);
    display: flex; align-items: center; justify-content: center;
    animation: ringRotate 8s linear infinite;
    padding: 3px;
  }
  .avatar-inner {
    width: 100%; height: 100%; border-radius: 50%;
    background: linear-gradient(135deg, #fff5ee, #fafafa);
    border: 2px solid #fff;
    display: flex; align-items: center; justify-content: center;
    animation: avatarFloat 3.5s ease-in-out infinite;
    font-size: 2.8rem;
  }

  .profile-name {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.6rem; color: #1a1a1a; letter-spacing: -0.5px;
    text-align: center; margin: 16px 0 4px;
    animation: fadeUp 0.5s ease 0.2s both;
  }
  .profile-role {
    display: inline-block;
    background: var(--orange-glow); color: var(--orange);
    font-family: 'DM Sans', sans-serif; font-weight: 600;
    font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase;
    padding: 4px 14px; border-radius: 100px; border: 1px solid rgba(255,106,0,0.2);
    animation: fadeUp 0.5s ease 0.3s both;
  }

  .divider { height: 1px; background: #f0f0f0; margin: 28px 0; }

  .action-btn {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 15px 20px; border-radius: 16px;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    text-decoration: none; border: 1.5px solid #f0f0f0;
    background: #fafafa; color: #444;
  }
  .action-btn:hover { transform: translateX(5px) scale(1.01); border-color: var(--orange); background: var(--orange-glow); color: var(--orange); }
  .action-btn i { width: 20px; text-align: center; font-size: 1rem; transition: transform 0.2s; }
  .action-btn:hover i { transform: scale(1.2); }

  .logout-btn {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 15px 20px; border-radius: 16px;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem;
    cursor: pointer; border: 1.5px solid rgba(231,76,60,0.2);
    background: rgba(231,76,60,0.04); color: #e74c3c;
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    margin-top: 10px;
  }
  .logout-btn:hover { transform: translateX(5px); background: rgba(231,76,60,0.08); border-color: #e74c3c; }

  .action-row { animation: fadeUp 0.5s ease var(--d) both; }
`;

const Profile = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const currentUserName = localStorage.getItem("currentUserName") || "User";
  const isAdmin = currentUserName === "Admin";

  const handleLogoutConfirm = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUserName");
    localStorage.removeItem("currentUserEmail");
    setShowLogout(false);
    navigate("/login");
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="profile-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="profile-card">
          {/* Avatar */}
          <div className="avatar-wrap">
            <div className="avatar-ring">
              <div className="avatar-inner">
                {isAdmin ? "👑" : "👤"}
              </div>
            </div>
            <div className="profile-name">{currentUserName}</div>
            <div className="profile-role">{isAdmin ? "Administrator" : "Customer"}</div>
          </div>

          <div className="divider" />

          <div className="d-grid gap-2">
            <div className="action-row" style={{ "--d": "0.3s" }}>
              <Link to="/" className="action-btn">
                <i className="bi bi-house-door-fill"></i>
                Back to Home
                <i className="bi bi-chevron-right ms-auto" style={{ fontSize: "0.75rem", color: "#ccc" }}></i>
              </Link>
            </div>

            <div className="action-row" style={{ "--d": "0.36s" }}>
              <Link to="/cart" className="action-btn">
                <i className="bi bi-cart3"></i>
                My Cart
                <i className="bi bi-chevron-right ms-auto" style={{ fontSize: "0.75rem", color: "#ccc" }}></i>
              </Link>
            </div>

            {isAdmin && (
              <div className="action-row" style={{ "--d": "0.42s" }}>
                <Link to="/admin" className="action-btn">
                  <i className="bi bi-speedometer2"></i>
                  Admin Dashboard
                  <i className="bi bi-chevron-right ms-auto" style={{ fontSize: "0.75rem", color: "#ccc" }}></i>
                </Link>
              </div>
            )}

            <div className="action-row" style={{ "--d": "0.48s" }}>
              <button
                className="logout-btn"
                onClick={() => setShowLogout(true)}
              >
                <i className="bi bi-box-arrow-right"></i>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <LogoutModal
          isOpen={showLogout}
          onClose={() => setShowLogout(false)}
          onConfirm={handleLogoutConfirm}
        />
      </div>
    </>
  );
};

export default Profile;