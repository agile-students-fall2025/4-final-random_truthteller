import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetails.css";
import { fetchCourseById } from "./api/courses";
import { getCurrentSchedule, addEventsToSchedule } from "./api/schedules";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      const c = await fetchCourseById(id);
      if (!c) {
        // If course not found, go back to search
        navigate("/courses");
        return;
      }
      setCourse(c);
      // if the mock data includes sections, use them; otherwise show placeholder
      setSections(c.sections || []);

      try {
        const { scheduleId } = await getCurrentSchedule();
        setCurrentScheduleId(scheduleId);
      } catch (e) {
        console.warn("Failed to load current schedule", e);
      }
    };
    load();
  }, [id, navigate]);

  const parseSectionToEvents = (section, course) => {
    const DAYS = new Map([
      ["Mon", 0],
      ["Tue", 1],
      ["Wed", 2],
      ["Thu", 3],
      ["Fri", 4],
    ]);

    if (!section.time) {
      return [];
    }

    const parts = String(section.time).match(
      /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/,
    );
    if (!parts) {
      return [];
    }

    const startTime = `${parts[1].padStart(2, "0")}:${parts[2]}`;
    const endTime = `${parts[3].padStart(2, "0")}:${parts[4]}`;
    const courseName = `${course.code} - ${course.title}`;
    const days = String(section.days || "")
      .split("/")
      .map((day) => day.trim())
      .filter(Boolean);

    return days
      .map((day) => DAYS.get(day))
      .filter((day) => day !== undefined)
      .map((day) => ({
        courseName,
        day,
        startTime,
        endTime,
        professor: section.instructor || course.instructor || "",
        room: section.location || "",
        credits: course.credits || 4,
      }));
  };

  const handleAddToCalendar = async (section) => {
    if (!currentScheduleId) {
      console.error("No current schedule ID");
      navigate("/schedules");
      return;
    }

    if (!course) {
      return;
    }

    setIsAdding(true);
    try {
      const events = parseSectionToEvents(section, course);
      if (events.length === 0) {
        alert("We couldn't read the meeting time for that section.");
        return;
      }

      await addEventsToSchedule(currentScheduleId, events);
      navigate(`/dashboard?scheduleId=${currentScheduleId}`);
    } catch (error) {
      console.error("Error adding course to schedule:", error);
      alert(`Failed to add course to schedule: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const goToCourseReviews = () => {
    const courseName = `${course.code} - ${course.title}`;
    navigate(`/reviews/course/${encodeURIComponent(courseName)}`);
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
      <h1 className="page-title">Course Details</h1>
      <div className="course-overview">
        <div className="course-header">
          <span className="course-code-large">{course.code}</span>
          <h2 className="course-name">{course.title}</h2>
        </div>
        <p className="course-long-desc">{course.description}</p>
        <div className="course-info-row">
          <span>{course.credits ? `${course.credits} credits` : ""}</span>
          <span>Department: {course.department || "TBA"}</span>
        </div>
        <button
          type="button"
          className="review-button course-reviews-button"
          onClick={goToCourseReviews}
        >
          Course reviews
        </button>
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
                    disabled={isAdding || !currentScheduleId}
                  >
                    {isAdding
                      ? "Adding..."
                      : currentScheduleId
                        ? "Add to schedule"
                        : "Select schedule first"}
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
