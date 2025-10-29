// Fetch list of courses
export const fetchCourses = async () => {
  if (!process.env.REACT_APP_MOCKAROO_API_KEY) {
    throw new Error(
      "REACT_APP_MOCKAROO_API_KEY is not set (check the Discord team channel for the key)",
    );
  }

  const apiKey = process.env.REACT_APP_MOCKAROO_API_KEY;
  const response = await fetch(
    `https://my.api.mockaroo.com/courses.json?key=${apiKey}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch courses: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const csv = await response.text();
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");
    data = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i] ? values[i].trim() : "";
      });
      return obj;
    });
  }

  const courses = data.map((item, index) => ({
    id: parseInt(item.id) || index,
    courseName: item.courseName,
  }));

  // remove duplicates
  const seen = new Set();
  const uniqueCourses = courses.filter((course) => {
    if (seen.has(course.courseName)) {
      return false;
    }
    seen.add(course.courseName);
    return true;
  });

  return uniqueCourses;
};

// Fetch course reviews
export const fetchCourseReviews = async () => {
  if (!process.env.REACT_APP_MOCKAROO_API_KEY) {
    throw new Error(
      "REACT_APP_MOCKAROO_API_KEY is not set (check the Discord team channel for the key)",
    );
  }

  const apiKey = process.env.REACT_APP_MOCKAROO_API_KEY;
  const response = await fetch(
    `https://my.api.mockaroo.com/course_reviews.json?key=${apiKey}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch course reviews: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const csv = await response.text();
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");
    data = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i] ? values[i].trim() : "";
      });
      return obj;
    });
  }

  let reviews = data.map((item, index) => ({
    id: parseInt(item.id) || index,
    rating: parseInt(item.rating),
    reviewText: item.reviewText,
    date: item.date,
  }));

  return reviews;
};

// Fetch professor reviews
export const fetchProfReviews = async () => {
  if (!process.env.REACT_APP_MOCKAROO_API_KEY) {
    throw new Error(
      "REACT_APP_MOCKAROO_API_KEY is not set (check the Discord team channel for the key)",
    );
  }

  const apiKey = process.env.REACT_APP_MOCKAROO_API_KEY;
  const response = await fetch(
    `https://my.api.mockaroo.com/professor_reviews.json?key=${apiKey}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch professor reviews: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const csv = await response.text();
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");
    data = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i] ? values[i].trim() : "";
      });
      return obj;
    });
  }

  let reviews = data.map((item, index) => ({
    id: parseInt(item.id) || index,
    rating: parseInt(item.rating),
    reviewText: item.reviewText,
    date: item.date,
  }));

  return reviews;
};
