import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>Random TruthTeller</h1>
      {/* TODO: point this to the login page if not authenticated otherwise dashboard */}
      <button onClick={() => navigate("/courses")} className="home-button">
        Get Started
      </button>
    </div>
  );
}

export default Home;

