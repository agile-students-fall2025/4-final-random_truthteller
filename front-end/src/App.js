import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import CourseSearch from "./CourseSearch";
import CourseReviews from "./CourseReviews";
import ProfReviews from "./ProfReviews";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseSearch />} />
          <Route path="/course-reviews" element={<CourseReviews />} />
          <Route path="/prof-reviews" element={<ProfReviews />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
