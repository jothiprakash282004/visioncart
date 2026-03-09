import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }
    if (email === "admin@gmail.com" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f4f6f9"
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
          width: "320px"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          🔐 Login
        </h2>

        {error && (
          <p style={{ color: "red", fontSize: "14px" }}>{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;