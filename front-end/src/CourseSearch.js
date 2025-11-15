import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseSearch.css";

function CourseSearch() {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    building: "",
    credits: "",
    days: [],
  });

  const navigate = useNavigate();

  //filter courses based on search
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/courses");
        const data = await res.json();
        setCourses(data);
        setDisplayedCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    //search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((course) => {
        const name = course.name || "";
        const code = course.code || "";
        const prof = course.professor || course.instructor || "";
        return (
          name.toLowerCase().includes(lowerQuery) ||
          code.toLowerCase().includes(lowerQuery) ||
          prof.toLowerCase().includes(lowerQuery)
        );
      });
    }

    //building filter
    if (filters.building) {
      filtered = filtered.filter(
        (course) =>
          course.building &&
          course.building.toLowerCase() === filters.building.toLowerCase(),
      );
    }

    //credits filter
    if (filters.credits) {
      filtered = filtered.filter(
        (course) => Number(course.credits) === Number(filters.credits),
      );
    }

    //days filter
    if (filters.days.length > 0) {
      filtered = filtered.filter((course) => {
        if (!course.days) return false;
        return filters.days.some((d) =>
          course.days.map((x) => x.toLowerCase()).includes(d.toLowerCase()),
        );
      });
    }

    setDisplayedCourses(filtered);
  }, [query, filters, courses]);

  const handleCourseClick = (courseId, courseName) => {
    navigate(`/courses/${encodeURIComponent(courseId)}`);
  };

  const toggleFilter = () => setShowFilter(!showFilter);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value, //toggle selection
    }));
  };

  const toggleDay = (day) => {
    setFilters((prev) => {
      const newDays = prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  };

  const clearFilters = () => {
    setFilters({ building: "", credits: "", days: [] });
  };

  return (
    <div className="course-search-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ←
      </button>
      <h1>Course Search</h1>

      <div className="search-form">
        <input
          type="text"
          placeholder="Search for a course..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="button" onClick={toggleFilter} className="filter-button">
          Filter / Sort
        </button>
      </div>

      {showFilter && (
        <div className="filter-popup">
          <h3>Filter Courses</h3>

          {/*building section */}
          <div className="filter-section">
            <h4>Building</h4>
            {["Hall A", "Hall B", "Hall C"].map((b) => (
              <button
                key={b}
                className={`filter-option ${
                  filters.building === b ? "selected" : ""
                }`}
                onClick={() => handleFilterChange("building", b)}
              >
                {b}
              </button>
            ))}
          </div>

          {/*credits section */}
          <div className="filter-section">
            <h4>Credits</h4>
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                className={`filter-option ${
                  filters.credits === c ? "selected" : ""
                }`}
                onClick={() => handleFilterChange("credits", c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/*days section */}
          <div className="filter-section">
            <h4>Days</h4>
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
              <button
                key={day}
                className={`filter-option ${
                  filters.days.includes(day) ? "selected" : ""
                }`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-filters">
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilter(false)}
              className="close-popup"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/*course list */}
      <div className="courses-list">
        {displayedCourses.length === 0 ? (
          <div className="results-placeholder">No courses found.</div>
        ) : (
          displayedCourses.map((course) => {
            const raw = course.name || "";
            const [maybeCode, maybeTitle] = raw.split(" - ", 2);
            const code = course.code || (maybeTitle ? maybeCode : "");
            const title = course.title || (maybeTitle ? maybeTitle : raw);
            const description =
              course.description ||
              course.shortDescription ||
              "No description available.";
            const credits = course.credits ? `${course.credits} credits` : "";
            const instructor = course.instructor || course.professor || "TBA";

            return (
              <div
                key={course.id}
                className="course-card"
                onClick={() =>
                  handleCourseClick(course.id, course.courseName || title)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCourseClick(course.id, course.courseName || title);
                  }
                }}
              >
                <div className="course-card-header">
                  {code && <div className="course-code">{code}</div>}
                  <h3 className="course-title">{title}</h3>
                </div>
                <p className="course-desc">{description}</p>
                <div className="course-meta">
                  {credits && <span className="course-credits">{credits}</span>}
                  <span className="course-instructor">
                    Instructor: {instructor}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CourseSearch;
