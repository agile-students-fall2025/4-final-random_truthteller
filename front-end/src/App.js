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
import SavedSchedules from "./SavedSchedules";
import { ThemeProvider } from "./ThemeContext";
import Settings from "./Settings";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  // check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // prefer token presence
    return (
      !!localStorage.getItem("authToken") ||
      localStorage.getItem("isAuthenticated") === "true"
    );
  });

  // Helper to decode token
  const getUserFromToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { email: payload.email, id: payload.userId };
    } catch (e) {
      return null;
    }
  };

  // use local storage to persist authentication state
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const userData = getUserFromToken(token);
      setUser(userData);
    }

    if (isAuthenticated) {
      localStorage.setItem("isAuthenticated", "true");
    } else {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("authToken");
      setUser(null);
    }

    // listen for cross-tab logout/login events
    function onStorage(e) {
      if (e.key === "auth-logout-time") {
        setIsAuthenticated(false);
        setUser(null);
      }
      if (e.key === "authToken" && e.newValue) {
        setIsAuthenticated(true);
        setUser(getUserFromToken(e.newValue));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    const token = localStorage.getItem("authToken");
    setUser(getUserFromToken(token));
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
                  <Dashboard user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/admin"
              element={
                isAuthenticated && user?.email === "admin@nyu.edu" ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/dashboard" replace />
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
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
