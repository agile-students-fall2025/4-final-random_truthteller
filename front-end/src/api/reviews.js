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
    ? `/api/reviews/course/${encodeURIComponent(courseName)}`
    : `/api/reviews/course`;
  const endpoint = params.toString() ? `${base}?${params.toString()}` : base;
  const response = await fetch(endpoint);
  return await handleResponse(response);
};

export const fetchProfReviews = async (profName, options = {}) => {
  const params = new URLSearchParams();
  if (options.sort) params.set("sort", options.sort);
  const base = profName
    ? `/api/reviews/professor/${encodeURIComponent(profName)}`
    : `/api/reviews/professor`;
  const endpoint = params.toString() ? `${base}?${params.toString()}` : base;
  const response = await fetch(endpoint);
  return await handleResponse(response);
};

export const fetchRmpProfReviews = async (profName, options = {}) => {
  const params = new URLSearchParams();
  if (options.sort) params.set("sort", options.sort);
  const base = profName
    ? `/api/reviews/rmp/professor/${encodeURIComponent(profName)}`
    : `/api/reviews/rmp/professor`;
  const endpoint = params.toString() ? `${base}?${params.toString()}` : base;
  const response = await fetch(endpoint);
  return await handleResponse(response);
};

export const fetchRmpCourseReviews = async (courseCode, options = {}) => {
  const params = new URLSearchParams();
  if (options.sort) params.set("sort", options.sort);
  const base = courseCode
    ? `/api/reviews/rmp/course/${encodeURIComponent(courseCode)}`
    : `/api/reviews/rmp/course`;
  const endpoint = params.toString() ? `${base}?${params.toString()}` : base;
  const response = await fetch(endpoint);
  return await handleResponse(response);
};

export const fetchRmpCourseStats = async (courseCode) => {
  const response = await fetch(
    `/api/reviews/rmp/course-stats/${encodeURIComponent(courseCode)}`,
  );
  return await handleResponse(response);
};

export const submitCourseReview = async (course, rating, reviewText) => {
  const response = await fetch("/api/reviews/course", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ course, rating, reviewText }),
  });
  return await handleResponse(response);
};

export const submitProfReview = async (professor, rating, reviewText) => {
  const response = await fetch("/api/reviews/professor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ professor, rating, reviewText }),
  });
  return await handleResponse(response);
};

export const flagReview = async (reviewId, reason, reviewType) => {
  const response = await fetch("/api/reviews/flag", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reviewId, reason, reviewType }),
  });
  return await handleResponse(response);
};

export const getRecentReviews = async (token) => {
  const response = await fetch("/api/reviews/recent", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await handleResponse(response);
};

export const deleteReview = async (token, type, id) => {
  const response = await fetch(`/api/reviews/${type}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await handleResponse(response);
};
