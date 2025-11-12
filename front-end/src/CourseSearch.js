import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseSearch.css";
import { fetchCourses } from "./mockData";

function CourseSearch() {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState("");
  const navigate = useNavigate();

  // fetch courses from backend
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

  // filter courses based on search
  useEffect(() => {
  let filtered = courses;

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

  setDisplayedCourses(filtered);
  }, [query, courses]);


  const handleCourseClick = (courseId, courseName) => {
    // Navigate to Course Details page for the selected course
    navigate(`/courses/${encodeURIComponent(courseId)}`);
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

      <div className="courses-list">
        {displayedCourses.length === 0 ? (
          <div className="results-placeholder">No courses found.</div>
        ) : (
          displayedCourses.map((course) => {
            // Support richer course objects if available, otherwise derive from courseName
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
