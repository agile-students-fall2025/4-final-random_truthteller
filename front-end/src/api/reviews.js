const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchCourseReviews = async (courseName, options = {}) => {
  const params = new URLSearchParams();
  if (options.sort) params.set("sort", options.sort);
  const base = courseName
    ? `${API_BASE_URL}/reviews/course/${encodeURIComponent(courseName)}`
    : `${API_BASE_URL}/reviews/course`;
  const endpoint = params.toString() ? `${base}?${params.toString()}` : base;
  const response = await fetch(endpoint);
  return await handleResponse(response);
};

export const fetchProfReviews = async (profName, options = {}) => {
  const params = new URLSearchParams();
  if (options.sort) params.set("sort", options.sort);
  const base = profName
    ? `${API_BASE_URL}/reviews/professor/${encodeURIComponent(profName)}`
    : `${API_BASE_URL}/reviews/professor`;
  const endpoint = params.toString() ? `${base}?${params.toString()}` : base;
  const response = await fetch(endpoint);
  return await handleResponse(response);
};

export const submitCourseReview = async (course, rating, reviewText) => {
  const response = await fetch(`${API_BASE_URL}/reviews/course`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ course, rating, reviewText }),
  });
  return await handleResponse(response);
};

export const submitProfReview = async (professor, rating, reviewText) => {
  const response = await fetch(`${API_BASE_URL}/reviews/professor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ professor, rating, reviewText }),
  });
  return await handleResponse(response);
};

export const flagReview = async (reviewId, reason, reviewType) => {
  const response = await fetch(`${API_BASE_URL}/reviews/flag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reviewId, reason, reviewType }),
  });
  return await handleResponse(response);
};
