import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Reviews.css";
import { fetchCourseReviews, fetchProfReviews } from "./api/reviews";

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

  const isProfessor = type === "professor";
  const decodedName = name ? decodeURIComponent(name) : null;
  const pageTitle = isProfessor ? "Professor" : "Course";

  // fetch reviews (can be either professor or course)
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = isProfessor
          ? await fetchProfReviews(decodedName)
          : await fetchCourseReviews(decodedName);
        setReviews(data);
        setDisplayedReviews(data);
      } catch (error) {
        console.error("Error fetching mock data:", error);
      }
    };

    loadReviews();
  }, [decodedName, isProfessor]);

  // filter reviews based on search query
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

      <div className="reviews-list">
        {displayedReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-date">
                <p>{review.date}</p>
              </div>
              <div className="review-rating">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>
            </div>
            <p className="review-text">{review.reviewText}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reviews;
