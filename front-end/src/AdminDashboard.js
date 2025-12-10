import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentReviews, getFlaggedReviews, deleteReview } from "./api/reviews";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recent"); // "recent" or "flagged"
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const data =
        activeTab === "flagged"
          ? await getFlaggedReviews(token)
          : await getRecentReviews(token);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
      setError("Failed to load reviews. Make sure you are an admin.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const token = localStorage.getItem("authToken");
      await deleteReview(token, type, id);
      // Remove from local state
      setReviews((prev) => prev.filter((r) => r.id !== id || r.type !== type));
    } catch (err) {
      console.error("Failed to delete review", err);
      alert("Failed to delete review");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-main">
          <div className="action-item admin-header-back">
            <button
              className="back-button"
              onClick={() => navigate("/dashboard")}
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              ←
            </button>
          </div>

          <h1>Admin Dashboard</h1>
        </div>
      </header>

      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === "recent" ? "active" : ""}`}
          onClick={() => handleTabChange("recent")}
        >
          Recent Reviews
        </button>
        <button
          className={`tab-button ${activeTab === "flagged" ? "active" : ""}`}
          onClick={() => handleTabChange("flagged")}
        >
          Flagged Reviews
        </button>
      </div>

      <div className="reviews-list">
        {loading ? (
          <div className="admin-loading">Loading reviews...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">
            {activeTab === "flagged"
              ? "No flagged reviews found."
              : "No reviews found."}
          </p>
        ) : (
          reviews.map((review) => (
            <div key={`${review.type}-${review.id}`} className="review-card">
              <div className="review-header">
                <span className="review-type">
                  {review.type === "course" ? "COURSE" : "PROFESSOR"}
                </span>
                <span className="review-subject">
                  {review.course || review.professor}
                </span>
                <span className="review-date">
                  {new Date(review.date).toLocaleString()}
                </span>
                {activeTab === "flagged" && (
                  <span className="flag-icon" title={`Flagged: ${review.flagReason}`}>
                    🚩
                  </span>
                )}
                <div className="action-item">
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(review.type, review.id)}
                    title="Delete Review"
                    aria-label="Delete Review"
                  >
                    🗑️
                  </button>
                  <span className="action-label">Delete</span>
                </div>
              </div>
              {activeTab === "flagged" && review.flagReason && (
                <div className="flag-reason">
                  <strong>Flag Reason:</strong> {review.flagReason}
                </div>
              )}
              <div className="review-content-wrapper">
                <div className="review-text-content">
                  <p className="review-text">{review.reviewText}</p>
                </div>
                <div className="review-rating">Rating: {review.rating}/5</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
