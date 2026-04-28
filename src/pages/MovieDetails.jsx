import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, Share2, ChevronRight, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { auth } from "../firebase";
import moviesData from "../data/movies.json";
import "../styles/movieDetails.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MovieDetails = () => {
  const { title } = useParams();
  const navigate = useNavigate();
  const decodedTitle = decodeURIComponent(title);
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reactions, setReactions] = useState([]);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trailer state
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    let foundMovie = null;
    let categoryKey = null;

    for (const [lang, movies] of Object.entries(moviesData)) {
      const match = movies.find((m) => m.title === decodedTitle);
      if (match) {
        foundMovie = match;
        categoryKey = lang;
        break;
      }
    }

    if (foundMovie) {
      setMovie(foundMovie);
      const recs = moviesData[categoryKey]
        .filter((m) => m.title !== decodedTitle)
        .slice(0, 10);
      setRecommendations(recs);
    }
  }, [decodedTitle]);

  // Fetch reviews from LocalStorage
  useEffect(() => {
    if (!decodedTitle) return;
    
    // Simulate real-time fetch with a simple interval or just initial load
    const loadReviews = () => {
      const allReviews = JSON.parse(localStorage.getItem("showbuzz_reviews") || "{}");
      const movieReviews = allReviews[decodedTitle] || [];
      // Sort by newest first
      movieReviews.sort((a, b) => b.createdAt - a.createdAt);
      setReviews(movieReviews);
    };

    loadReviews();
    
    // Load reactions
    const loadReactions = () => {
      const allReactions = JSON.parse(localStorage.getItem("showbuzz_reactions") || "{}");
      setReactions(allReactions[decodedTitle] || []);
    };
    loadReactions();

    // Listen for custom event to update reviews across tabs or after submission
    window.addEventListener("reviewsUpdated", loadReviews);
    return () => window.removeEventListener("reviewsUpdated", loadReviews);
  }, [decodedTitle]);

  const submitReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    // Use mock auth or firebase auth user
    const currentUser = auth?.currentUser || { 
      uid: "local-user", 
      displayName: "Guest User", 
      email: "guest@example.com" 
    };

    setIsSubmitting(true);
    
    setTimeout(() => {
      const newReview = {
        id: Date.now().toString(),
        text: newReviewText,
        rating: Number(newReviewRating),
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        createdAt: Date.now()
      };

      const allReviews = JSON.parse(localStorage.getItem("showbuzz_reviews") || "{}");
      const movieReviews = allReviews[decodedTitle] || [];
      
      allReviews[decodedTitle] = [...movieReviews, newReview];
      localStorage.setItem("showbuzz_reviews", JSON.stringify(allReviews));
      
      // Trigger update
      window.dispatchEvent(new Event("reviewsUpdated"));

      setNewReviewText("");
      setNewReviewRating(10);
      setIsSubmitting(false);
    }, 500); // Small delay to simulate network request
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen text-black">
          <h2>Movie not found.</h2>
        </div>
      </div>
    );
  }

  const castList = movie.cast || [];
  const crewList = [];
  if (movie.director) crewList.push({ role: "Director", name: movie.director });
  if (movie.crew) {
    Object.entries(movie.crew).forEach(([key, value]) => {
      crewList.push({ role: key.charAt(0).toUpperCase() + key.slice(1), name: value });
    });
  }

  const genres = movie.genre.split("/").join(", ");

  // Helper to format YouTube link to embed format
  const getEmbedUrl = (url) => {
    if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"; // Default fallback if no trailer
    
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      return url + (url.includes("?") ? "&autoplay=1" : "?autoplay=1");
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  return (
    <div className="movie-details-page">
      <Navbar />
      
      {/* Hero Section */}
      <div className="md-hero-section">
        <div
          className="md-hero-bg"
          style={{ backgroundImage: `url(${movie.poster})` }}
        ></div>

        <div className="md-hero-content container">
          <div className="md-poster-container">
            <img src={movie.poster} alt={movie.title} className="md-poster" />
            <div className="md-poster-label">In cinemas</div>
          </div>

          <div className="md-info-container">
            <h1 className="md-title">{movie.title}</h1>

            <div className="md-rating-box">
              <div className="md-rating-score">
                <Star className="md-star-icon" fill="var(--primary)" size={24} />
                <span className="md-score">{movie.rating}/10</span>
                <span className="md-votes">Rate now</span>
                <ChevronRight size={16} />
              </div>
              <button className="md-rate-btn">Rate now</button>
            </div>

            <div className="md-tags-row">
              <span className="md-tag md-light-tag">2D</span>
              <span className="md-tag md-light-tag">Hindi</span>
            </div>

            <div className="md-meta-row">
              {movie.duration} • {genres} • UA16+ • 16 Apr, 2026
            </div>

            <div className="md-action-buttons">
              <button 
                className={`md-book-btn ${movie.category === "Upcoming" ? "disabled" : ""}`}
                disabled={movie.category === "Upcoming"}
                onClick={() => movie.category !== "Upcoming" && navigate(`/book/${encodeURIComponent(movie.title)}`)}
              >
                {movie.category === "Upcoming" ? "Coming Soon" : "Book tickets"}
              </button>
              <button 
                onClick={() => setIsTrailerOpen(true)}
                className="md-trailer-btn"
              >
                View Trailer
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
        {/* About */}
        <section className="md-section">
          <h2 className="md-section-title">About the movie</h2>
          <p className="md-description">{movie.description}</p>
        </section>

        {reactions.length > 0 && (
          <section className="md-section">
            <h2 className="md-section-title">Friends' Reactions</h2>
            <div className="md-reactions-row">
              {reactions.map((r, i) => (
                <div key={i} className="md-reaction-bubble" title={r.userName}>
                  <span className="reaction-emoji">{r.emoji}</span>
                  <span className="reaction-user">{r.userName}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <hr className="md-divider" />

        {/* Offers */}
        <section className="md-section">
          <h2 className="md-section-title">Top offers for you</h2>
          <div className="md-offers-scroll custom-scrollbar">
            <div className="md-offer-card">
              <div className="md-offer-icon">🏷️</div>
              <div className="md-offer-text">
                <h4>YES Private Debit Card Offer</h4>
                <p>Tap to view details</p>
              </div>
            </div>
            <div className="md-offer-card">
              <div className="md-offer-icon">💳</div>
              <div className="md-offer-text">
                <h4>IndusInd Bank Credit Card Assured Movie...</h4>
                <p>Tap to view details</p>
              </div>
            </div>
          </div>
        </section>

        <hr className="md-divider" />

        {/* Cast */}
        {castList.length > 0 && (
          <section className="md-section">
            <h2 className="md-section-title">Cast</h2>
            <div className="md-people-scroll custom-scrollbar">
              {castList.map((actor, idx) => (
                <div className="md-person-card" key={idx}>
                  <div className="md-person-avatar">
                    {actor.charAt(0)}
                  </div>
                  <h4 className="md-person-name">{actor}</h4>
                  <p className="md-person-role">Actor</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Crew */}
        {crewList.length > 0 && (
          <section className="md-section">
            <h2 className="md-section-title">Crew</h2>
            <div className="md-people-scroll custom-scrollbar">
              {crewList.map((crew, idx) => (
                <div className="md-person-card" key={idx}>
                  <div className="md-person-avatar">
                    {crew.name.charAt(0)}
                  </div>
                  <h4 className="md-person-name">{crew.name}</h4>
                  <p className="md-person-role">{crew.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <hr className="md-divider" />

        {/* Reviews */}
        <section className="md-section">
          <div className="md-section-header">
            <h2 className="md-section-title">Reviews</h2>
            <span className="md-reviews-count">{reviews.length} reviews</span>
          </div>

          {/* Add Review Form */}
          <div className="md-add-review-box">
            <h4>Add Your Review</h4>
            <form onSubmit={submitReview}>
              <div className="md-review-rating-input">
                <label>Rating:</label>
                <input 
                  type="number" 
                  min="1" max="10" 
                  value={newReviewRating} 
                  onChange={(e) => setNewReviewRating(e.target.value)}
                  required
                />
                <span>/ 10</span>
              </div>
              <textarea 
                placeholder="What did you think of the movie?" 
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                required
                className="md-review-textarea"
              ></textarea>
              <button type="submit" disabled={isSubmitting} className="md-submit-review-btn">
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          <div className="md-reviews-scroll custom-scrollbar">
            {reviews.length === 0 ? (
              <p className="md-no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div className="md-review-card" key={review.id}>
                  <div className="md-review-header">
                    <div className="md-reviewer-info">
                      <div className="md-reviewer-avatar">
                        {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h4 className="md-reviewer-name">{review.userName || "Anonymous"}</h4>
                        <p className="md-reviewer-source">Booked on <span className="md-brand">ShowBuzz</span></p>
                      </div>
                    </div>
                    <div className="md-review-score">
                      <Star fill="var(--primary)" size={14} /> {review.rating}/10
                    </div>
                  </div>
                  <p className="md-review-text">{review.text}</p>
                  <div className="md-review-footer">
                    <div className="md-review-actions">
                      <span className="md-action"><ThumbsUp size={14} /> Helpful</span>
                    </div>
                    <div className="md-review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <hr className="md-divider" />

        {/* You might also like */}
        {recommendations.length > 0 && (
          <section className="md-section">
            <div className="md-section-header">
              <h2 className="md-section-title">You might also like</h2>
              <span className="md-view-all">View All <ChevronRight size={14} /></span>
            </div>
            
            <div className="md-recommendations custom-scrollbar">
              {recommendations.map((rec, idx) => (
                <Link to={`/movie/${encodeURIComponent(rec.title)}`} key={idx} className="md-rec-card">
                  <div className="md-rec-poster-wrapper">
                    <img src={rec.poster} alt={rec.title} className="md-rec-poster" />
                  </div>
                  <div className="md-rec-likes">
                    <ThumbsUp size={14} fill="#2ecc71" color="#2ecc71" /> {rec.rating * 10}K+ likes
                  </div>
                  <h4 className="md-rec-title">{rec.title}</h4>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Trailer Modal */}
      {isTrailerOpen && (
        <div className="md-trailer-modal-overlay" onClick={() => setIsTrailerOpen(false)}>
          <div className="md-trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="md-trailer-close-container">
              <button className="md-trailer-close-btn" onClick={() => setIsTrailerOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="md-trailer-video-wrapper">
              <iframe 
                src={getEmbedUrl(movie.trailer)} 
                title={`${movie.title} Trailer`}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default MovieDetails;
