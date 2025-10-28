import React, { useState } from "react";
import "./CourseSearch.css";

function CourseSearch() {
  const [query, setQuery] = useState("");

  //placeholder for when user clicks "Search"
  const handleSearch = (e) => {
    e.preventDefault();
    //for NOW, we just log what the user typed
    console.log("User searched for:", query);
  };

  return (
    <div className="course-search-page">
      <h1>Course Search</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for a course..."
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

export default CourseSearch;
