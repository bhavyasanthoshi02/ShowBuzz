import React, { useState, useEffect } from "react";
import { Play, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const HeroCarousel = ({ items }) => {
  const [current, setCurrent] = useState(0);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const navigate = useNavigate();
  const slides = items?.slice(0, 5) || [];

  useEffect(() => {
    if (slides.length === 0 || trailerMovie) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, trailerMovie]);

  const getEmbedUrl = (url) => {
    if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
    } catch (e) {
      console.error("Invalid trailer URL:", url);
    }
    return url;
  };

  const handleDetails = (item) => {
    if (item.type === "movie") navigate(`/movie/${encodeURIComponent(item.title)}`);
    else if (item.type === "sport") navigate(`/sports-detail/${item.id}`);
    else if (item.type === "music") navigate(`/music-detail/${item.id}`);
  };

  const handleBooking = (item) => {
    if (item.type === "movie") navigate(`/book/${encodeURIComponent(item.title)}`);
    else if (item.type === "sport") navigate(`/book-sport/${item.id}`);
    else if (item.type === "music") navigate(`/book-music/${item.id}`);
  };

  if (slides.length === 0) return null;

  return (
    <div className="hero-carousel">
      {slides.map((item, i) => (
        <div key={i} className={`hero-slide ${i === current ? "active" : ""}`}>
          <div 
            className="hero-bg" 
            onClick={() => handleDetails(item)}
            style={{ cursor: "pointer" }}
          >
            <img src={item.poster} alt={item.title} />
            <div className="hero-overlay-x" />
            <div className="hero-overlay-y" />
            <div className="hero-overlay-dark" />
          </div>

          <div className="hero-content">
            <span className="hero-badge" onClick={() => handleDetails(item)} style={{ cursor: "pointer" }}>
              {item.type === "movie" ? "Now Showing" : item.type === "sport" ? "Live Action" : "Live Concert"}
            </span>
            <h1 className="hero-title" onClick={() => handleDetails(item)} style={{ cursor: "pointer" }}>{item.title}</h1>
            <p className="hero-desc">
              {item.type === "movie" ? (
                <>
                  In a world where stories come alive, experience the thrill of {item.genre.toLowerCase()}.
                  <span className="hero-meta">
                    {item.duration} &bull; ⭐ {item.rating}/10 &bull; {item.genre}
                  </span>
                </>
              ) : item.type === "sport" ? (
                <>
                  Experience the pulse of the stadium. Catch the {item.category} excitement live.
                  <span className="hero-meta">
                    {item.date} &bull; {item.venue}
                  </span>
                </>
              ) : (
                <>
                  Feel the rhythm of the night. Join the ultimate {item.category} concert experience.
                  <span className="hero-meta">
                    {item.date} &bull; {item.venue}
                  </span>
                </>
              )}
            </p>

            <div className="hero-actions">
              <button 
                className="btn-primary"
                onClick={() => handleBooking(item)}
              >
                <Play size={18} fill="white" />
                {item.type === "movie" ? "Book Tickets" : item.type === "sport" ? "Book Seats" : "Get Tickets"}
              </button>
              {item.type === "movie" && (
                <button className="btn-secondary" onClick={() => setTrailerMovie(item)}>Watch Trailer</button>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="hero-pagination">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`hero-dot ${i === current ? "active" : ""}`}
          />
        ))}
      </div>

      {trailerMovie && (
        <div className="hc-trailer-modal-overlay" onClick={() => setTrailerMovie(null)}>
          <div className="hc-trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="hc-trailer-close-container">
              <button className="hc-trailer-close-btn" onClick={() => setTrailerMovie(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="hc-trailer-video-wrapper">
              <iframe
                src={getEmbedUrl(trailerMovie.trailer)}
                title={`${trailerMovie.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;