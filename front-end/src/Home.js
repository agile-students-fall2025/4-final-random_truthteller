import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>ProfPick</h1>
      <button onClick={() => navigate("/dashboard")} className="home-button">
        Get Started
      </button>
    </div>
  );
}

export default Home;
