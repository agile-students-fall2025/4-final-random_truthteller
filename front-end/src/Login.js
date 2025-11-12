import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${isLogin ? "Login" : "Signup"} attempt with:`, {
      email,
      password,
    });
    onLogin?.();
    navigate("/dashboard");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">ProfPick</h1>
        <div className="login-box">
          <div className="login-header">
            <h2>{isLogin ? "Login" : "Sign Up"}</h2>
            <p className="login-subtitle">
              {isLogin
                ? "Welcome back! Please sign in to your account."
                : "Create a new account to get started."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">NYU Email</label>
              <input
                id="email"
                type="email"
                placeholder="your.name@nyu.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <button type="submit" className="login-button">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={toggleMode}
                className="toggle-button"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
