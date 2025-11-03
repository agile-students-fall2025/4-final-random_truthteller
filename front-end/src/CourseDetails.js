import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CourseDetails.css";
import { fetchCourseDetails } from "./mockData";

function CourseDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const decodedName = name ? decodeURIComponent(name) : "";

  const [details, setDetails] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourseDetails(decodedName);
        setDetails(data);
      } catch (e) {
        console.error("Failed to load course details", e);
      }
    };
    load();
  }, [decodedName]);

  const goToCourseReviews = () => {
    navigate(`/reviews/course/${encodeURIComponent(decodedName)}`);
  };

  const goToProfReviews = (professorName) => {
    navigate(`/reviews/professor/${encodeURIComponent(professorName)}`);
  };

  if (!details) {
    return (
      <div className="course-details-page">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <h1>Course Details</h1>
        <div className="loading">Loading…</div>
      </div>
    );
  }

  return (
    <div className="course-details-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ←
      </button>
      <h1>Course Details</h1>

      <div className="course-summary">
        <h2 className="course-title">{decodedName}</h2>
        <p className="course-meta">
          {details.credits} Credits • Prereqs: {details.prereqs || "None"}
        </p>
        {details.description && (
          <p className="course-description">{details.description}</p>
        )}
        <button
          type="button"
          className="primary-button"
          onClick={goToCourseReviews}
        >
          View Reviews
        </button>
      </div>

      <h3 className="sections-heading">Sections</h3>
      <div className="sections-list">
        {details.sections.map((section) => (
          <div className="section-card" key={section.sectionId}>
            <div className="section-row">
              <span className="section-name">{section.name}</span>
              <span className="seats">
                {section.enrolled}/{section.capacity} seats
              </span>
            </div>
            <div className="section-row">
              <span>{section.professor}</span>
              <span>
                {section.days} {section.time}
              </span>
            </div>
            <div className="section-row">
              <span>Location: {section.location}</span>
            </div>
            <div className="section-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/dashboard")}
              >
                Add to Schedule
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => goToProfReviews(section.professor)}
              >
                Prof Reviews
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseDetails;
