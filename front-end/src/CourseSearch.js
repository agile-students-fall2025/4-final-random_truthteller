import React, { useState } from "react";
import "./CourseSearch.css";

function CourseSearch() {
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState("");

  //placeholder for search function
  const handleSearch = (e) => {
    e.preventDefault();
    console.log(
      "User searched for:",
      query,
      "in",
      selectedMajor || "All majors",
    );
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleMajorSelect = (major) => {
    setSelectedMajor(major);
    setShowFilter(false);
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

        <button type="button" onClick={toggleFilter} className="filter-button">
          Filter / Sort
        </button>
      </form>

      {showFilter && (
        <div className="filter-popup">
          <h3>Filter by Major</h3>
          <ul>
            {["Computer Science", "Biology", "Mathematics", "Economics"].map(
              (major) => (
                <li key={major}>
                  <button
                    className="major-option"
                    onClick={() => handleMajorSelect(major)}
                  >
                    {major}
                  </button>
                </li>
              ),
            )}
          </ul>
          <button onClick={toggleFilter} className="close-popup">
            Close
          </button>
        </div>
      )}

      <div className="results-placeholder">
        <p>
          {selectedMajor
            ? `Showing courses for ${selectedMajor}`
            : "Search results will appear here."}
        </p>
      </div>
    </div>
  );
}

export default CourseSearch;
