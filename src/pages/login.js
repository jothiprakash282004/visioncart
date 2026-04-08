import React, { useState } from "react";


function Login() {


  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (!isLoginMode && !name)) {
      setError("Please fill all fields");
      return;
    }

    if (isLoginMode) {
      // Login flow
      if (email === "admin@gmail.com" && password === "1234") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUserName", "Admin");
        localStorage.setItem("userId", "0"); // Admin mock user ID
        window.location.href = "/";
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("currentUserName", data.name);
          localStorage.setItem("userId", data.id);
          window.location.href = "/";
        } else {
          setError(data.error || "Invalid email or password");
        }
      } catch (error) {
        console.error("Login Error:", error);
        setError("Server error. Please check your database connection.");
      }
    } else {
      // Sign Up flow
      try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (res.ok) {
          setError("");
          alert("Account created successfully! Please log in.");
          setIsLoginMode(true);
        } else {
          setError(data.error || "An account with this email already exists");
        }
      } catch (error) {
        console.error("Registration Error:", error);
        setError("Server error. Please check your database connection.");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "transparent" }}>
      <div className="container d-flex justify-content-center">
        
        <form 
          onSubmit={handleSubmit} 
          className="premium-card p-5 w-100 shadow-lg" 
          style={{ maxWidth: "450px" }}
        >
          <div className="text-center mb-4">
            <h2 className="fw-bold text-gradient mb-2">{isLoginMode ? "Login" : "Sign Up"}</h2>
            <p className="text-muted fs-6">
              {isLoginMode ? "Sign in to your FusionCart account" : "Create a new FusionCart account"}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger text-center fw-bold py-2 mb-4" style={{ background: "transparent", border: "1px solid #dc3545", color: "#ff4d4d" }}>
              {error}
            </div>
          )}

          {!isLoginMode && (
            <div className="mb-4 text-start">
              <label className="form-label text-dark fw-bold">Full Name</label>
              <input
                type="text"
                className="form-control form-control-lg premium-input shadow-none"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="mb-4 text-start">
            <label className="form-label text-dark fw-bold">Email Address</label>
            <input
              type="email"
              className="form-control form-control-lg premium-input shadow-none"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4 text-start">
            <label className="form-label text-dark fw-bold">Password</label>
            <input
              type="password"
              className="form-control form-control-lg premium-input shadow-none"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-premium btn-lg w-100 fw-bold shadow-sm rounded-pill"
          >
            {isLoginMode ? "Sign In" : "Create Account"}
          </button>

          <div className="text-center mt-4">
            <p className="text-muted small fw-semibold">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="btn btn-link p-0 text-gradient-success fw-bold text-decoration-none ms-1" 
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError("");
                }}
              >
                {isLoginMode ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}

export default Login;