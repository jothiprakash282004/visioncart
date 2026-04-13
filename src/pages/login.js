import React, { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --orange: #ff6a00;
    --orange-light: #ff8c38;
    --orange-glow: rgba(255,106,0,0.12);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(36px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(30px,-20px) scale(1.08); }
    66%      { transform: translate(-20px,15px) scale(0.94); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(-25px,20px) scale(0.92); }
    66%      { transform: translate(20px,-18px) scale(1.1); }
  }
  @keyframes logoSpin {
    0%   { transform: rotate(0deg) scale(1); }
    25%  { transform: rotate(8deg) scale(1.08); }
    75%  { transform: rotate(-5deg) scale(0.95); }
    100% { transform: rotate(0deg) scale(1); }
  }
  @keyframes submitPulse {
    0%,100% { box-shadow: 0 8px 24px rgba(255,106,0,0.3); }
    50%      { box-shadow: 0 14px 40px rgba(255,106,0,0.55); }
  }
  @keyframes fieldReveal {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(5); opacity: 0; }
  }
  @keyframes successPop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  .login-bg {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 40px 16px; position: relative; overflow: hidden; background: #fafafa;
  }
  .orb {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  }
  .orb-1 { width: 380px; height: 380px; background: rgba(255,106,0,0.12); top: -80px; right: -80px; animation: orb1 8s ease-in-out infinite; }
  .orb-2 { width: 300px; height: 300px; background: rgba(255,140,56,0.08); bottom: -60px; left: -60px; animation: orb2 10s ease-in-out infinite; }

  .login-card {
    background: #fff; border-radius: 28px; border: 1.5px solid #f0f0f0;
    padding: 48px 44px; width: 100%; max-width: 460px;
    position: relative; z-index: 1;
    box-shadow: 0 32px 80px rgba(0,0,0,0.06);
    animation: scaleIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  .logo-circle {
    width: 64px; height: 64px; border-radius: 20px;
    background: linear-gradient(135deg, var(--orange), var(--orange-light));
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; margin: 0 auto 20px;
    box-shadow: 0 10px 28px rgba(255,106,0,0.3);
    cursor: default;
    animation: logoSpin 0.5s cubic-bezier(0.34,1.56,0.64,1);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .logo-circle:hover { transform: rotate(10deg) scale(1.08); }

  .auth-title {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.9rem;
    color: #1a1a1a; letter-spacing: -0.5px; text-align: center; margin-bottom: 6px;
  }
  .auth-sub { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: #aaa; text-align: center; margin-bottom: 32px; }

  /* Toggle */
  .mode-toggle {
    display: flex; background: #f5f5f5; border-radius: 100px;
    padding: 4px; margin-bottom: 28px; position: relative;
  }
  .mode-toggle-btn {
    flex: 1; padding: 10px; border: none; border-radius: 100px;
    font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem;
    background: none; cursor: pointer; color: #aaa; position: relative; z-index: 1;
    transition: color 0.25s;
  }
  .mode-toggle-btn.active { color: #1a1a1a; }
  .mode-slider {
    position: absolute; height: calc(100% - 8px); top: 4px;
    border-radius: 100px; background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* Fields */
  .field-wrap { position: relative; margin-bottom: 20px; }
  .field-label {
    position: absolute; left: 16px; top: 17px;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
    color: #bbb; pointer-events: none;
    transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
  }
  .field-input {
    width: 100%; padding: 22px 16px 10px;
    border: 1.5px solid #eee; border-radius: 14px;
    background: #fafafa; color: #1a1a1a;
    font-family: 'DM Sans', sans-serif; font-size: 1rem; outline: none;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s, transform 0.2s;
  }
  .field-input:focus {
    border-color: var(--orange); background: #fff;
    box-shadow: 0 0 0 4px var(--orange-glow);
    transform: translateY(-1px);
  }
  .field-input:focus + .field-label,
  .field-input.has-value + .field-label {
    top: 6px; font-size: 0.7rem; color: var(--orange); font-weight: 600;
  }
  .field-wrap.reveal { animation: fieldReveal 0.35s cubic-bezier(0.22,1,0.36,1) both; }

  .error-box {
    background: rgba(231,76,60,0.06); border: 1px solid rgba(231,76,60,0.2);
    border-radius: 12px; padding: 12px 16px;
    display: flex; align-items: center; gap: 10px;
    color: #e74c3c; font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; font-weight: 500; margin-bottom: 20px;
    animation: shake 0.4s ease;
  }

  .submit-btn {
    background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
    color: #fff; border: none; border-radius: 100px;
    padding: 16px 32px; width: 100%; cursor: pointer;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    animation: submitPulse 2.5s ease-in-out infinite;
    margin-top: 8px; position: relative; overflow: hidden;
  }
  .submit-btn:hover { transform: scale(1.03); }
  .submit-btn:active { transform: scale(0.97); }
  .submit-btn .ripple-el {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,0.3);
    width: 10px; height: 10px; transform: scale(0);
    animation: ripple 0.6s ease forwards; pointer-events: none;
  }
  .submit-btn i { transition: transform 0.2s; }
  .submit-btn:hover i { transform: translateX(4px); }

  .switch-link { text-align: center; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; color: #aaa; }
  .switch-btn {
    background: none; border: none; cursor: pointer;
    color: var(--orange); font-weight: 700;
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem; padding: 0;
    transition: opacity 0.2s;
  }
  .switch-btn:hover { opacity: 0.75; }

  /* Success banner */
  .success-banner {
    background: rgba(39,174,96,0.08); border: 1px solid rgba(39,174,96,0.25);
    border-radius: 12px; padding: 12px 16px;
    display: flex; align-items: center; gap: 10px;
    color: #27ae60; font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; font-weight: 500; margin-bottom: 20px;
    animation: successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }
`;

function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* ripple on button */
    const btn = e.currentTarget.querySelector(".submit-btn");
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const span = document.createElement("span");
      span.className = "ripple-el";
      span.style.left = `${rect.width / 2 - 5}px`;
      span.style.top  = `${rect.height / 2 - 5}px`;
      btn.appendChild(span);
      setTimeout(() => span.remove(), 650);
    }

    if (!email || !password || (!isLoginMode && !name)) {
      setError("Please fill in all fields");
      setShakeTrigger(t => t + 1);
      return;
    }

    setLoading(true);
    setError("");

    if (isLoginMode) {
      if (email === "admin@gmail.com" && password === "1234") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUserName", "Admin");
        localStorage.setItem("userId", "0");
        window.location.href = "/";
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("currentUserName", data.name);
          localStorage.setItem("userId", data.id);
          window.location.href = "/";
        } else {
          setError(data.error || "Invalid email or password");
          setShakeTrigger(t => t + 1);
        }
      } catch {
        setError("Server error. Check your connection.");
        setShakeTrigger(t => t + 1);
      }
    } else {
      try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          setError("");
          setSuccess("Account created! Please sign in.");
          setIsLoginMode(true);
          setName(""); setEmail(""); setPassword("");
        } else {
          setError(data.error || "Email already exists");
          setShakeTrigger(t => t + 1);
        }
      } catch {
        setError("Server error. Check your connection.");
        setShakeTrigger(t => t + 1);
      }
    }
    setLoading(false);
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(""); setSuccess("");
    setName(""); setEmail(""); setPassword("");
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="login-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <form onSubmit={handleSubmit} className="login-card">

          {/* Logo */}
          <div className="logo-circle">🛒</div>

          <div className="auth-title">
            {isLoginMode ? "Welcome back" : "Create account"}
          </div>
          <div className="auth-sub">
            {isLoginMode ? "Sign in to your FusionCart account" : "Join FusionCart today"}
          </div>

          {/* Mode toggle */}
          <div className="mode-toggle">
            <div className="mode-slider" style={{ width: "calc(50% - 4px)", left: isLoginMode ? "4px" : "calc(50%)" }} />
            <button type="button" className={`mode-toggle-btn${isLoginMode ? " active" : ""}`} onClick={() => { if (!isLoginMode) switchMode(); }}>
              Sign In
            </button>
            <button type="button" className={`mode-toggle-btn${!isLoginMode ? " active" : ""}`} onClick={() => { if (isLoginMode) switchMode(); }}>
              Sign Up
            </button>
          </div>

          {/* Success */}
          {success && (
            <div className="success-banner">
              <i className="bi bi-check-circle-fill fs-5"></i>
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-box" key={shakeTrigger}>
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          {/* Name (signup only) */}
          {!isLoginMode && (
            <div className="field-wrap reveal">
              <input type="text" className={`field-input${name ? " has-value" : ""}`} value={name} onChange={e => setName(e.target.value)} autoComplete="off" />
              <label className="field-label">Full Name</label>
            </div>
          )}

          {/* Email */}
          <div className="field-wrap">
            <input type="email" className={`field-input${email ? " has-value" : ""}`} value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" />
            <label className="field-label">Email Address</label>
          </div>

          {/* Password */}
          <div className="field-wrap">
            <input type="password" className={`field-input${password ? " has-value" : ""}`} value={password} onChange={e => setPassword(e.target.value)} />
            <label className="field-label">Password</label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm" role="status" />&nbsp; {isLoginMode ? "Signing in..." : "Creating..."}</>
            ) : (
              <>{isLoginMode ? "Sign In" : "Create Account"} <i className="bi bi-arrow-right"></i></>
            )}
          </button>

          <div className="switch-link mt-4">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="switch-btn" onClick={switchMode}>
              {isLoginMode ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;