import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Login from "./Login";
import CourseSearch from "./CourseSearch";
import CourseReviews from "./CourseReviews";
import ProfReviews from "./ProfReviews";
import Dashboard from "./Dashboard"; 

function App() {
  // check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  // use local storage to persist authentication state
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("isAuthenticated", "true");
    } else {
      localStorage.removeItem("isAuthenticated");
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/courses"
            element={
              isAuthenticated ? (
                <CourseSearch />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/course-reviews"
            element={
              isAuthenticated ? (
                <CourseReviews />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/prof-reviews"
            element={
              isAuthenticated ? (
                <ProfReviews />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
