import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetails.css";
import { fetchCourseById } from "./mockData";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const load = async () => {
      const c = await fetchCourseById(parseInt(id, 10));
      if (!c) {
        // If course not found, go back to search
        navigate("/courses");
        return;
      }
      setCourse(c);
      // if the mock data includes sections, use them; otherwise show placeholder
      setSections(c.sections || []);
    };
    load();
  }, [id, navigate]);

  const handleAddToCalendar = (section) => {
    // Placeholder: in a real app we'd integrate with calendar APIs or add to user's schedule
    alert(`Added section ${section.sectionId} to your calendar (placeholder).`);
  };

  const goToCourseReviews = () => {
    navigate(`/reviews/course/${encodeURIComponent(course.courseName)}`);
  };

  const goToProfReviews = (profName) => {
    navigate(`/reviews/professor/${encodeURIComponent(profName)}`);
  };

  if (!course) return <div className="course-details-page">Loading...</div>;

  return (
    <div className="course-details-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ←
      </button>
      <h1>{course.title || course.courseName}</h1>
      <div className="course-overview">
        <div className="course-code-large">{course.code}</div>
        <p className="course-long-desc">{course.description}</p>
        <div className="course-info-row">
          <span>{course.credits ? `${course.credits} credits` : ""}</span>
          <span>Department: {course.department || "TBA"}</span>
          <button
            type="button"
            className="review-button"
            onClick={goToCourseReviews}
          >
            See course reviews
          </button>
        </div>
      </div>

      <section className="sections">
        <h2>Sections</h2>
        {sections.length === 0 ? (
          <div className="results-placeholder">
            No sections available for this course.
          </div>
        ) : (
          <ul className="sections-list">
            {sections.map((s) => (
              <li key={s.sectionId} className="section-item">
                <div className="section-main">
                  <div>
                    <strong>{s.sectionId}</strong> &nbsp; {s.days} {s.time}
                  </div>
                  <div>Location: {s.location || "TBA"}</div>
                  <div>Instructor: {s.instructor}</div>
                </div>
                <div className="section-actions">
                  <button
                    className="add-calendar"
                    onClick={() => handleAddToCalendar(s)}
                  >
                    Add to calendar
                  </button>
                  <button
                    className="review-button"
                    onClick={() => goToProfReviews(s.instructor)}
                  >
                    Professor reviews
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default CourseDetails;
