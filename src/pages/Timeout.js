import React from "react";
import { useNavigate } from "react-router-dom";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --orange: #ff6a00; --orange-light: #ff8c38; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes clockTick {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes clockFade {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.6; transform: scale(0.94); }
  }
  @keyframes warningPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(243,156,18,0.4); }
    50%      { box-shadow: 0 0 0 16px rgba(243,156,18,0); }
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 8px 24px rgba(255,106,0,0.3); }
    50%      { box-shadow: 0 14px 40px rgba(255,106,0,0.5); }
  }

  .timeout-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 40px 16px;
    font-family: 'DM Sans', sans-serif;
  }
  .timeout-card {
    background: #fff; border-radius: 32px;
    border: 1.5px solid #f0f0f0;
    padding: 56px 48px; width: 100%; max-width: 460px;
    text-align: center;
    box-shadow: 0 32px 80px rgba(0,0,0,0.05);
    animation: scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
    position: relative; overflow: hidden;
  }
  .timeout-glow {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(243,156,18,0.06), transparent 70%);
    pointer-events: none;
  }

  .clock-wrap {
    position: relative; display: inline-block; margin-bottom: 28px;
  }
  .clock-bg {
    width: 96px; height: 96px; border-radius: 50%;
    background: rgba(243,156,18,0.1);
    display: flex; align-items: center; justify-content: center;
    animation: warningPulse 2s ease-in-out infinite;
  }
  .clock-icon {
    font-size: 2.8rem;
    animation: clockFade 2s ease-in-out infinite;
  }

  /* Animated clock hands */
  .clock-svg {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    width: 56px; height: 56px;
  }
  .clock-hand-min {
    transform-origin: 28px 28px;
    animation: clockTick 4s linear infinite;
  }
  .clock-hand-sec {
    transform-origin: 28px 28px;
    animation: clockTick 1s linear infinite;
  }

  .timeout-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.8rem; color: #1a1a1a; letter-spacing: -0.5px;
    margin-bottom: 12px; animation: fadeUp 0.5s ease 0.2s both;
  }
  .timeout-sub {
    color: #888; font-size: 0.95rem; line-height: 1.65;
    margin-bottom: 36px; animation: fadeUp 0.5s ease 0.3s both;
  }

  .timeout-tip {
    background: rgba(243,156,18,0.06); border: 1px solid rgba(243,156,18,0.2);
    border-radius: 14px; padding: 14px 20px;
    margin-bottom: 28px; text-align: left;
    animation: fadeUp 0.5s ease 0.4s both;
  }
  .timeout-tip-title {
    font-weight: 700; font-size: 0.82rem; color: #c8930a; margin-bottom: 6px;
    display: flex; align-items: center; gap: 6px;
  }
  .timeout-tip ul {
    margin: 0; padding-left: 20px;
    font-size: 0.82rem; color: #888; line-height: 1.7;
  }

  .home-btn {
    background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
    color: #fff; border: none; border-radius: 100px;
    padding: 16px 32px; width: 100%;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    cursor: pointer;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    animation: pulse 2.5s ease-in-out infinite, fadeUp 0.5s ease 0.5s both;
  }
  .home-btn:hover { transform: scale(1.03); }
  .home-btn:active { transform: scale(0.97); }

  .retry-btn {
    background: none; border: 1.5px solid #e8e8e8;
    border-radius: 100px; padding: 12px 32px; width: 100%; margin-top: 12px;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.9rem;
    color: #666; cursor: pointer;
    transition: all 0.2s;
    animation: fadeUp 0.5s ease 0.55s both;
  }
  .retry-btn:hover { border-color: var(--orange); color: var(--orange); background: rgba(255,106,0,0.04); }
`;

const Timeout = () => {
  const navigate = useNavigate();
  return (
    <>
      <style>{STYLES}</style>
      <div className="timeout-page">
        <div className="timeout-card">
          <div className="timeout-glow" />

          <div className="clock-wrap">
            <div className="clock-bg">
              <span className="clock-icon">⏱</span>
            </div>
          </div>

          <div className="timeout-title">Session Timed Out</div>
          <p className="timeout-sub">
            Your payment session has expired. The order was not completed.
            Don't worry — your cart is still saved.
          </p>

          <div className="timeout-tip">
            <div className="timeout-tip-title">
              <i className="bi bi-lightbulb-fill"></i> Why did this happen?
            </div>
            <ul>
              <li>Payment sessions expire after 5 minutes for security</li>
              <li>Your cart items are still saved — just head back</li>
              <li>Try again at a time of stable internet connection</li>
            </ul>
          </div>

          <button className="home-btn" onClick={() => navigate("/")}>
            <i className="bi bi-house-fill"></i> Back to Home
          </button>
          <button className="retry-btn" onClick={() => navigate("/cart")}>
            <i className="bi bi-arrow-counterclockwise me-2"></i>Try Again from Cart
          </button>
        </div>
      </div>
    </>
  );
};

export default Timeout;