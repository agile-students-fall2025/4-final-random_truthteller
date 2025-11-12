import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Settings.css";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);
  return(
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
          <button type="button"
          className="light-button"
          onClick={()=> setTheme("light")}>Light Mode</button>
          <button type="button"
          className="dark-button"
          onClick={()=>{setTheme("dark")}}>Dark Mode</button>
        </div>
        <div className="account">
          <h2 className="account-title">Account Settings</h2>
          <button type="button" className="changepassword-button" onClick={()=>  {} }>Change Password</button>
          <button type="button" className="logout-button" onClick={()=> navigate("/Login")  }>Log Out</button>
        </div>
      </div>
    </div>
  )
}