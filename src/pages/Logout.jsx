import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import "../styles/logout.css";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="logout-page">
      <div className="logout-card">
        <div className="logout-icon-wrapper">
          <CheckCircle size={64} className="logout-check-icon" />
        </div>
        <h1 className="logout-title">See you soon!</h1>
        <p className="logout-subtitle">You have been successfully logged out.</p>
        <p className="logout-redirect">Redirecting to login in a moment...</p>
        <button className="logout-btn" onClick={() => navigate("/login")}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Logout;
