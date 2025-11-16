import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import * as accountsApi from "./api/accounts";
import * as authApi from "./api/auth";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);
  const [accounts, setAccounts] = useState([]);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        if (!token) throw new Error("Not authenticated");
        const result = await accountsApi.getAccounts(token);
        if (!mounted) return;
        setAccounts(result.accounts || []);
        setCurrentAccountId(result.currentAccountId || null);
      } catch (err) {
        setError(err.message || "Failed to load accounts");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleLogout = async () => {
    try {
      await authApi.logout(token);
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    // notify other tabs via storage event
    localStorage.setItem('auth-logout-time', Date.now());
    navigate('/login');
  };

  return (
    <div className={`settings-page ${theme}`}>
      <button
        type="button"
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ←
      </button>
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>
        <div className="display">
          <h2 className="display-title">Display Settings</h2>
          <button
            type="button"
            className="light-button"
            onClick={() => setTheme("light")}
          >
            Light Mode
          </button>
          <button
            type="button"
            className="dark-button"
            onClick={() => {
              setTheme("dark");
            }}
          >
            Dark Mode
          </button>
        </div>
        <div className="account">
          <h2 className="account-title">Account Settings</h2>
          <div className="account-logout">
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}