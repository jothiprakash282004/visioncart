// =====================================================================
// SUCCESS PAGE
// =====================================================================
import React from "react";
import { useNavigate } from "react-router-dom";

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --orange: #ff6a00; --orange-light: #ff8c38; }
`;

const SUCCESS_STYLES = `
  ${SHARED_STYLES}

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.75); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes checkDraw {
    from { stroke-dashoffset: 80; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ringPop {
    from { transform: scale(0); opacity: 0.6; }
    to   { transform: scale(2.4); opacity: 0; }
  }
  @keyframes confettiFall {
    0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 8px 24px rgba(255,106,0,0.3); }
    50%      { box-shadow: 0 14px 40px rgba(255,106,0,0.5); }
  }

  .success-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 40px 16px;
    font-family: 'DM Sans', sans-serif;
  }
  .success-card {
    background: #fff; border-radius: 32px;
    border: 1.5px solid #f0f0f0;
    padding: 56px 48px; width: 100%; max-width: 480px;
    text-align: center; position: relative;
    box-shadow: 0 32px 80px rgba(0,0,0,0.05);
    animation: scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
    overflow: hidden;
  }
  .success-glow {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(39,174,96,0.06), transparent 70%);
    pointer-events: none;
  }

  /* Animated check */
  .check-wrap {
    position: relative; display: inline-block; margin-bottom: 28px;
  }
  .check-circle {
    width: 96px; height: 96px; border-radius: 50%;
    background: rgba(39,174,96,0.1);
    display: flex; align-items: center; justify-content: center;
    animation: scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
  }
  .check-svg {
    width: 56px; height: 56px;
  }
  .check-path {
    fill: none; stroke: #27ae60; stroke-width: 4;
    stroke-linecap: round; stroke-linejoin: round;
    stroke-dasharray: 80; stroke-dashoffset: 80;
    animation: checkDraw 0.5s ease 0.3s both;
  }
  .ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid rgba(39,174,96,0.4);
    animation: ringPop 1s ease 0.4s both;
  }
  .ring2 {
    animation-delay: 0.6s;
  }

  .confetti-dot {
    position: absolute; width: 8px; height: 8px; border-radius: 50%;
    animation: confettiFall 1.2s ease both;
  }

  .success-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.8rem; color: #1a1a1a; letter-spacing: -0.5px;
    margin-bottom: 12px; animation: fadeUp 0.5s ease 0.35s both;
  }
  .success-sub {
    color: #888; font-size: 0.95rem; line-height: 1.65;
    margin-bottom: 36px; animation: fadeUp 0.5s ease 0.45s both;
  }

  .order-info-row {
    display: flex; justify-content: center; gap: 24px;
    margin-bottom: 32px; flex-wrap: wrap;
    animation: fadeUp 0.5s ease 0.5s both;
  }
  .order-info-chip {
    background: #fafafa; border: 1.5px solid #f0f0f0;
    border-radius: 100px; padding: 8px 18px;
    font-size: 0.8rem; font-weight: 600; color: #555;
    display: flex; align-items: center; gap: 6px;
  }

  .home-btn {
    background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
    color: #fff; border: none; border-radius: 100px;
    padding: 16px 32px; width: 100%;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    cursor: pointer;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    animation: pulse 2.5s ease-in-out infinite, fadeUp 0.5s ease 0.55s both;
  }
  .home-btn:hover { transform: scale(1.03); }
  .home-btn:active { transform: scale(0.97); }
`;

const CONFETTI_COLORS = ["#ff6a00","#27ae60","#3498db","#f39c12","#e91e63","#9b59b6"];

export const Success = () => {
  const navigate = useNavigate();
  const confetti = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${10 + i * 8}%`,
    top: `${20 + (i % 3) * 12}%`,
    delay: `${i * 80}ms`,
  }));

  return (
    <>
      <style>{SUCCESS_STYLES}</style>
      <div className="success-page">
        <div className="success-card">
          <div className="success-glow" />

          {/* Confetti */}
          {confetti.map(c => (
            <div key={c.id} className="confetti-dot"
              style={{ background: c.color, left: c.left, top: c.top, animationDelay: c.delay }} />
          ))}

          {/* Animated check */}
          <div className="check-wrap">
            <div className="check-circle">
              <svg className="check-svg" viewBox="0 0 52 52">
                <polyline className="check-path" points="14,26 22,35 38,17" />
              </svg>
            </div>
            <div className="ring" />
            <div className="ring ring2" />
          </div>

          <div className="success-title">Payment Successful!</div>
          <p className="success-sub">
            Thank you for your order. It has been placed successfully and will be processed shortly.
          </p>

          <div className="order-info-row">
            <div className="order-info-chip">
              <i className="bi bi-bag-check-fill" style={{ color: "#27ae60" }}></i>
              Order Confirmed
            </div>
            <div className="order-info-chip">
              <i className="bi bi-truck" style={{ color: "var(--orange)" }}></i>
              Processing Soon
            </div>
          </div>

          <button className="home-btn" onClick={() => navigate("/")}>
            <i className="bi bi-house-fill"></i> Back to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default Success;