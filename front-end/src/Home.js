import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">ProfPick</h1>
        <p className="home-subtitle">Smarter course planning with in‑context professor ratings.</p>
        <p className="home-blurb">
          Build better schedules faster. Compare section times alongside instructor quality so you can
          make confident decisions during hectic registration windows.
        </p>
        <button onClick={() => navigate("/login")} className="home-button">
          Sign in to continue
        </button>
      </div>
      <div className="home-highlights">
        <div className="highlight">
          <h3>Unified View</h3>
          <p>See times, sections, and ratings in one place.</p>
        </div>
        <div className="highlight">
          <h3>Conflict Aware</h3>
          <p>Avoid overlaps while exploring alternatives quickly.</p>
        </div>
        <div className="highlight">
          <h3>Plan and Save</h3>
          <p>Iterate on schedules and keep favorites for later.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
