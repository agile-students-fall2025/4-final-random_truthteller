import React, { useState } from "react";
import "./CourseReviews.css";

function CourseReviews() {
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState("");

  //placeholder for when user clicks "Search"
  const handleSearch = (e) => {
    e.preventDefault();
    //for NOW, we just log what the user typed
    console.log("User searched for:", query);
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const conditionSelect = (condition) => {
    setSelectedCondition(condition);
    setShowFilter(false);
  };

  return (
    <div className="course-reviews-page">
      <h1>Course Reviews</h1>

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

        <button type="button" onClick={toggleFilter} className="filter-button">
          Sort by
        </button>
      </form>

      {showFilter && (
        <div className="filter-popup">
          <h3>Sort by</h3>
          <ul>
            {["Newest First", "Oldest First", "Most Positive First", "Most Negative First"].map(
              (condition) => (
                <li key={condition}>
                  <button
                    className="condition-option"
                    onClick={() => conditionSelect(condition)}
                  >
                    {condition}
                  </button>
                </li>
              )
            )}
          </ul>
          <button onClick={toggleFilter} className="close-popup">
            Close
          </button>
        </div>
      )}

      {/*placeholder section for results later*/}
      <div className="results-placeholder">
        <p>
          {selectedCondition
            ? `Showing reviews sorted by ${selectedCondition}`
            : "Search results will appear here."}
        </p>
      </div>
    </div>
  );
}

export default CourseReviews;
