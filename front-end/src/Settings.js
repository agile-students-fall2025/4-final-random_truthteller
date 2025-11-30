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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

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
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    // notify other tabs via storage event
    localStorage.setItem("auth-logout-time", Date.now());
    navigate("/login");
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

          <div className="account-password">
            <h3 className="visually-hidden">Account Actions</h3>
            <div className="account-actions-row">
              <button
                type="button"
                className="logout-button changepassword-button"
                onClick={() => {
                  setShowPasswordForm((s) => !s);
                  setPasswordMsg("");
                  setError("");
                }}
              >
                Change password
              </button>
            </div>

            {showPasswordForm && (
              <div className="password-dropdown">
                <div className="form-group">
                  <label>Current password</label>
                  <input
                    className="password-input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>New password</label>
                  <input
                    className="password-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm new password</label>
                  <input
                    className="password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="light-button"
                    onClick={async () => {
                      setPasswordMsg("");
                      setError("");
                      try {
                        if (!currentPassword || !newPassword)
                          return setPasswordMsg(
                            "Please fill both password fields",
                          );
                        if (newPassword !== confirmPassword)
                          return setPasswordMsg("New passwords do not match");
                        await authApi.changePassword(
                          token,
                          currentPassword,
                          newPassword,
                        );
                        setPasswordMsg("Password changed successfully");
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        // auto-close after success
                        setTimeout(() => setShowPasswordForm(false), 800);
                      } catch (err) {
                        setError(err.message || "Failed to change password");
                      }
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="light-button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                      setPasswordMsg("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {passwordMsg && (
                  <div className="password-success">{passwordMsg}</div>
                )}
              </div>
            )}

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
    </div>
  );
}
