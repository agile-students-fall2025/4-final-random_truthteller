import React, { useState } from "react";
import "./ProfReviews.css";

function ProfReviews() {
  const [query, setQuery] = useState("");

  //placeholder for when user clicks "Search"
  const handleSearch = (e) => {
    e.preventDefault();
    //for NOW, we just log what the user typed
    console.log("User searched for:", query);
  };

  return (
    <div className="prof-reviews-page">
      <h1>Professor Reviews</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for a review by name, text, etc."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {/*Placeholder section for results later*/}
      <div className="results-placeholder">
        <p>Search results will appear here.</p>
      </div>
    </div>
  );
}

export default ProfReviews;
