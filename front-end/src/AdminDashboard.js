import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentReviews, deleteReview } from "./api/reviews";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const data = await getRecentReviews(token);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
      setError("Failed to load reviews. Make sure you are an admin.");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div className="admin-loading">Loading reviews...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          ←
        </button>
      </header>

      <div className="reviews-list">
        <h2>Recent Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews found.</p>
        ) : (
          reviews.map((review) => (
            <div key={`${review.type}-${review.id}`} className="review-card">
              <div className="review-header">
                <span className="review-type">
                  {review.type === "course" ? "Course" : "Professor"}
                </span>
                <span className="review-subject">
                  {review.course || review.professor}
                </span>
                <span className="review-date">{review.date}</span>
              </div>
              <div className="review-rating">Rating: {review.rating}/5</div>
              <p className="review-text">{review.reviewText}</p>
              <button
                className="delete-button"
                onClick={() => handleDelete(review.type, review.id)}
              >
                Delete Review
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
