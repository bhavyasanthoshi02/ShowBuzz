import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Clock, Star, Share2, Info, ChevronRight, ThumbsUp } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import sportsData from "../data/sports.json";
import musicData from "../data/music.json";
import "../styles/movieDetails.css";

const EventDetails = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const data = type === "sports" ? sportsData : musicData;
    const found = data.find(e => e.id === id);
    if (found) setEvent(found);
  }, [id, type]);


  if (!event) return <div className="bk-loading">Loading...</div>;

  const handleBook = () => {
    if (event.status === "Sold Out" || event.status === "Upcoming") return;
    const path = type === "sports" ? `/book-sport/${id}` : `/book-music/${id}`;
    navigate(path);
  };

  return (
    <div className="movie-details-page">
      <Navbar />
      
      {/* Hero Section - Using movie details classes for consistency */}
      <div className="md-hero-section">
        <div
          className="md-hero-bg"
          style={{ backgroundImage: `url(${event.poster})` }}
        ></div>

        <div className="md-hero-content container">
          <div className="md-poster-container">
            <img src={event.poster} alt={event.title} className="md-poster" />
            <div className="md-poster-label">{event.status}</div>
          </div>

          <div className="md-info-container">
            <h1 className="md-title">{event.title}</h1>

            <div className="md-rating-box">
              <div className="md-rating-score">
                <Star className="md-star-icon" fill="var(--primary)" size={24} />
                <span className="md-score">New Event</span>
                <span className="md-votes">Be the first to rate</span>
                <ChevronRight size={16} />
              </div>
            </div>

            <div className="md-tags-row">
              <span className="md-tag md-light-tag">{event.category}</span>
              <span className="md-tag md-light-tag">Live</span>
            </div>

            <div className="md-meta-row">
              <Calendar size={14} /> {event.date} • <Clock size={14} /> {event.time} • {event.venue.split(",")[0]}
            </div>

            <div className="md-action-buttons">
              <button 
                className={`md-book-btn ${event.status === "Sold Out" || event.status === "Upcoming" ? "disabled" : ""}`}
                disabled={event.status === "Sold Out" || event.status === "Upcoming"}
                onClick={handleBook}
              >
                {event.status === "Sold Out" ? "Sold Out" : event.status === "Upcoming" ? "Stay Tuned" : "Book tickets"}
              </button>
            </div>
          </div>

          <div className="md-share-btn-wrapper">
            <button className="md-share-btn">
              <Share2 size={18} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="md-content-container container">
        <section className="md-section">
          <h2 className="md-section-title">About the event</h2>
          <p className="md-description">
            {event.description || `Join us for an unforgettable experience at ${event.venue}. This ${event.category} event promises to be one of the highlights of the season.`}
          </p>
        </section>

        <hr className="md-divider" />

        <section className="md-section">
          <h2 className="md-section-title">Venue Information</h2>
          <div className="md-description" style={{display: "flex", alignItems: "center", gap: "10px"}}>
             <MapPin size={20} color="var(--primary)" />
             <div>
               <p style={{margin: 0, fontWeight: "700"}}>{event.venue}</p>
               <p style={{margin: 0, color: "#666", fontSize: "14px"}}>Please reach the venue 30 minutes before the start time.</p>
             </div>
          </div>
        </section>

        <hr className="md-divider" />

        <section className="md-section">
          <h2 className="md-section-title">Important Instructions</h2>
          <ul className="md-description" style={{paddingLeft: "20px"}}>
            <li>Carry a valid photo ID proof.</li>
            <li>Entry will be permitted only with an M-Ticket.</li>
            <li>Outside food and beverages are not allowed.</li>
            <li>Security procedures, including frisking, remain at the discretion of the event staff.</li>
          </ul>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default EventDetails;
