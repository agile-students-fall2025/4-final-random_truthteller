const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

// MOCK IMPLEMENTATION
export const fetchAllCourses = async () => {
  console.log("MOCK fetchAllCourses");
  return [
    {
      _id: "mock-course-1",
      code: "CS-UY 101",
      title: "Intro to CS",
      description: "Introduction to Computer Science",
      credits: 4,
      building: "370 Jay St",
      days: ["Mon", "Wed"],
    },
    {
      _id: "mock-course-2",
      code: "MA-UY 102",
      title: "Calculus I",
      description: "Calculus I",
      credits: 4,
      building: "2 MetroTech",
      days: ["Tue", "Thu"],
    },
  ];
};

export const fetchCourseById = async (id) => {
  console.log("MOCK fetchCourseById", id);
  return {
    _id: id || "mock-course-1",
    code: "CS-UY 101",
    title: "Intro to CS",
    description: "Introduction to Computer Science",
    credits: 4,
    building: "370 Jay St",
    days: ["Mon", "Wed"],
    sections: [
      {
        sectionNumber: "A",
        professor: "John Doe",
        days: ["Mon", "Wed"],
        startTime: "10:00",
        endTime: "11:30",
        room: "Room 101",
      },
    ],
  };
};
