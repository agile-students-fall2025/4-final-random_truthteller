import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Reviews.css";
import {
  fetchCourseReviews,
  fetchProfReviews,
  submitCourseReview,
  submitProfReview,
  flagReview,
  fetchRmpCourseStats,
} from "./api/reviews";

function Reviews() {
  const { type, name } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  // TODO: use this for sorting reviews
  // eslint-disable-next-line no-unused-vars
  const [selectedCondition, setSelectedCondition] = useState("");
  const [reviews, setReviews] = useState([]);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [courseStats, setCourseStats] = useState(null);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);

  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState("");
  const [flagReason, setFlagReason] = useState("");

  const isProfessor = type === "professor";
  const decodedName = name ? decodeURIComponent(name) : null;
  const pageTitle = isProfessor ? "Professor" : "Course";

  // fetch reviews (can be either professor or course)
  // map UI condition strings to backend sort keys
  const mapSortKey = (condition) => {
    switch ((condition || "").toLowerCase()) {
      case "newest first":
      case "newest":
        return "newest";
      case "oldest first":
      case "oldest":
        return "oldest";
      case "most positive first":
      case "most positive":
        return "most_positive";
      case "most negative first":
      case "most negative":
        return "most_negative";
      default:
        return undefined;
    }
  };

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const sortKey = mapSortKey(selectedCondition);
        const options = sortKey ? { sort: sortKey } : {};
        let data = [];
        data = isProfessor
          ? await fetchProfReviews(decodedName, options)
          : await fetchCourseReviews(decodedName, options);

        setReviews(data);
        setDisplayedReviews(data);

        // If we're on a course page, also fetch aggregated RMP course stats
        if (!isProfessor && decodedName) {
          try {
            // Course pages pass a display name like "CSCI-UA 3 - Course Title".
            // The RMP stats endpoint expects the canonical course code (e.g. "CSCI-UA 3").
            const courseKey = decodedName.includes(" - ")
              ? decodedName.split(" - ")[0].trim()
              : decodedName.trim();
            const stats = await fetchRmpCourseStats(courseKey);
            setCourseStats(stats);
          } catch (e) {
            console.warn("Failed to load RMP course stats:", e);
            setCourseStats(null);
          }
        } else {
          setCourseStats(null);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    loadReviews();
  }, [decodedName, isProfessor, selectedCondition]);

  // filter reviews based on search query
  // filter reviews based on search query (client-side) after we receive sorted data from server
  useEffect(() => {
    let filtered = reviews;

    if (query) {
      filtered = reviews.filter((review) =>
        review.reviewText.toLowerCase().includes(query.toLowerCase()),
      );
    }

    setDisplayedReviews(filtered);
  }, [query, reviews]);

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const conditionSelect = (condition) => {
    setSelectedCondition(condition);
    setShowFilter(false);
  };

  const handleAddReview = async () => {
    if (!newReviewRating || !newReviewText.trim()) {
      alert("Please provide both a rating and review text");
      return;
    }

    try {
      if (isProfessor) {
        await submitProfReview(decodedName, newReviewRating, newReviewText);
      } else {
        await submitCourseReview(decodedName, newReviewRating, newReviewText);
      }

      // Reload reviews
      const data = isProfessor
        ? await fetchProfReviews(decodedName)
        : await fetchCourseReviews(decodedName);
      setReviews(data);
      setDisplayedReviews(data);

      // Reset form
      setNewReviewRating(0);
      setNewReviewText("");
      setShowAddReviewModal(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  const handleFlagClick = (reviewId) => {
    setSelectedReviewId(reviewId);
    setFlagReason("");
    setShowFlagModal(true);
  };

  const handleFlagSubmit = async () => {
    if (!flagReason.trim()) {
      alert("Please provide a reason for flagging this review");
      return;
    }

    try {
      await flagReview(
        selectedReviewId,
        flagReason,
        isProfessor ? "professor" : "course",
      );
      alert("Review flagged successfully. Thank you for your feedback.");
      setShowFlagModal(false);
      setSelectedReviewId(null);
      setFlagReason("");
    } catch (error) {
      console.error("Error flagging review:", error);
      alert("Failed to flag review. Please try again.");
    }
  };

  return (
    <div className="reviews-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ←
      </button>
      <h1>
        {decodedName ? `Reviews for: ${decodedName}` : `${pageTitle} Reviews`}
      </h1>

      <div className="add-review-section">
        <button
          type="button"
          className="add-review-button"
          onClick={() => setShowAddReviewModal(true)}
        >
          <span className="add-review-icon">+</span> Add Review
        </button>
        {/* RMP reviews now migrated into main Review collection; no toggle needed */}
      </div>

      <div className="search-form">
        <input
          type="text"
          placeholder="Search for a review"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="button" onClick={toggleFilter} className="filter-button">
          Sort by
        </button>
      </div>

      {showFilter && (
        <div className="filter-popup">
          <h3>Sort by</h3>
          <ul>
            {[
              "Newest First",
              "Oldest First",
              "Most Positive First",
              "Most Negative First",
            ].map((condition) => (
              <li key={condition}>
                <button
                  className="condition-option"
                  onClick={() => conditionSelect(condition)}
                >
                  {condition}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={toggleFilter} className="close-popup">
            Close
          </button>
        </div>
      )}

      {/* Show aggregated course stats (from RMP) when available */}
      {courseStats && (
        <div className="course-stats-card">
          <h3>Course Statistics (Calculated from RateMyProfessors)</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Difficulty (avg)</div>
              <div className="stat-value">
                {courseStats.difficulty ? courseStats.difficulty.average : "—"}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Most Common Grade</div>
              <div className="stat-value">
                {courseStats.mostCommonGrade || "—"}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Would Take Again</div>
              <div className="stat-value">
                {courseStats.wouldTakeAgain &&
                courseStats.wouldTakeAgain.average != null
                  ? `${courseStats.wouldTakeAgain.average}%`
                  : "—"}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Reviews</div>
              <div className="stat-value">{courseStats.totalReviewCount}</div>
            </div>
          </div>
        </div>
      )}

      <div className="reviews-list">
        {displayedReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-date">
                <p>{review.date.slice(0, 10)}</p>
              </div>
              {(review.source === "ratemyprofessors" ||
                (review.meta && review.meta.source === "ratemyprofessors")) && (
                <div className="review-source">
                  <span className="rmp-badge">From RateMyProfessor</span>
                </div>
              )}
              <div className="review-rating">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>
              <button
                type="button"
                className="flag-button"
                onClick={() => handleFlagClick(review.id)}
                title="Flag this review"
              >
                🚩
              </button>
            </div>
            <p className="review-text">{review.reviewText}</p>
          </div>
        ))}
      </div>

      {/* Add Review Modal */}
      {showAddReviewModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddReviewModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add your review</h2>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-button ${newReviewRating >= star ? "selected" : ""}`}
                  onClick={() => setNewReviewRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="review-textarea"
              placeholder="Write your review here..."
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              rows={6}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="modal-button cancel"
                onClick={() => {
                  setShowAddReviewModal(false);
                  setNewReviewRating(0);
                  setNewReviewText("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-button submit"
                onClick={handleAddReview}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Review Modal */}
      {showFlagModal && (
        <div className="modal-overlay" onClick={() => setShowFlagModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Flag Review</h2>
            <p className="modal-description">
              Please tell us why you're flagging this review:
            </p>
            <textarea
              className="review-textarea"
              placeholder="Enter reason for flagging..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="modal-button cancel"
                onClick={() => {
                  setShowFlagModal(false);
                  setSelectedReviewId(null);
                  setFlagReason("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-button submit"
                onClick={handleFlagSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;
