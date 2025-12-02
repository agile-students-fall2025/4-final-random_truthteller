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
import CourseDetails from "./CourseDetails";
import Dashboard from "./Dashboard";
import Reviews from "./Reviews";
import AdminReviews from "./AdminReviews";
import SavedSchedules from "./SavedSchedules";
import { ThemeProvider } from "./ThemeContext";
import Settings from "./Settings";

function App() {
  // check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // prefer token presence
    return (
      !!localStorage.getItem("authToken") ||
      localStorage.getItem("isAuthenticated") === "true"
    );
  });

  // use local storage to persist authentication state
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("isAuthenticated", "true");
    } else {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("authToken");
    }

    // listen for cross-tab logout/login events
    function onStorage(e) {
      if (e.key === "auth-logout-time") {
        setIsAuthenticated(false);
      }
      if (e.key === "authToken" && e.newValue) {
        setIsAuthenticated(true);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <ThemeProvider>
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
              path="/courses/:id"
              element={
                isAuthenticated ? (
                  <CourseDetails />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/reviews/:type/:name?"
              element={
                isAuthenticated ? <Reviews /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/courses/:id"
              element={
                isAuthenticated ? (
                  <CourseDetails />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/reviews/:type/:name?"
              element={
                isAuthenticated ? <Reviews /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/schedules"
              element={
                isAuthenticated ? (
                  <SavedSchedules />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/settings"
              element={
                isAuthenticated ? (
                  <Settings />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/admin/reviews"
              element={
                isAuthenticated ? (
                  <AdminReviews />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
