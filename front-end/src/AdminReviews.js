import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRecentReviews, deleteReview } from "./api/reviews";
import "./Reviews.css"; // Reuse review styles

function AdminReviews() {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const data = await fetchRecentReviews();
            setReviews(data);
        } catch (error) {
            console.error("Failed to load reviews", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await deleteReview(id);
                await loadReviews(); // Refresh list
            } catch (error) {
                console.error("Failed to delete review", error);
                alert("Failed to delete review");
            }
        }
    };

    return (
        <div className="reviews-page">
            <button
                type="button"
                className="back-button"
                onClick={() => navigate("/dashboard")}
            >
                ←
            </button>
            <h1>Admin: Recent Reviews</h1>

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <p>No reviews found.</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-date">
                                    <p>{review.date}</p>
                                </div>
                                <div className="review-rating">
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(5 - review.rating)}
                                </div>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDelete(review.id)}
                                    title="Delete Review"
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "1.2rem",
                                        marginLeft: "auto",
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                            <div
                                className="review-subject"
                                style={{
                                    fontWeight: "bold",
                                    marginBottom: "8px",
                                    fontSize: "0.9rem",
                                    color: "#555",
                                }}
                            >
                                {review.type === "professor" ? "Professor: " : "Course: "}
                                {review.subject}
                            </div>
                            <p className="review-text">{review.reviewText}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AdminReviews;
