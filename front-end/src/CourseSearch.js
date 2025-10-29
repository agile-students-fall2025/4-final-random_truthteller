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

  // fetch courses from Mockaroo
  useEffect(() => {
    // Reset state when component mounts
    setQuery("");
    setCourses([]);
    setDisplayedCourses([]);

    const loadCourses = async () => {
      try {
        const data = await fetchCourses();

        const uniqueCoursesMap = new Map();
        data.forEach((course) => {
          if (course.courseName && course.courseName.trim().length > 0) {
            uniqueCoursesMap.set(course.courseName, course);
          }
        });

        const filteredCourses = Array.from(uniqueCoursesMap.values()).sort(
          (a, b) => {
            return a.courseName.localeCompare(b.courseName);
          },
        );

        setCourses(filteredCourses);
        setDisplayedCourses(filteredCourses);
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
      filtered = filtered.filter((course) =>
        course.courseName.toLowerCase().includes(query.toLowerCase()),
      );
    }

    setDisplayedCourses(filtered);
  }, [query, courses]);

  const handleCourseClick = (courseName) => {
    // TODO: this should really navigate to the Course Details page (which shows the class sections)
    // for now, we are navigating directly to that course's reviews page as a placeholder
    navigate(`/reviews/course/${encodeURIComponent(courseName)}`);
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
        {displayedCourses.map((course) => (
          <div
            key={course.id}
            className="course-card"
            onClick={() => handleCourseClick(course.courseName)}
          >
            <h3 className="course-name">{course.courseName}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseSearch;
