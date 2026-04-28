import React from "react";
import { Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const MovieCard = ({ movie, favorites, toggleFavorite }) => {
  const navigate = useNavigate();
  const isFav = favorites?.some((m) => m.title === movie.title);

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${encodeURIComponent(movie.title)}`)} style={{cursor: "pointer"}}>
      <div className="movie-card-img-wrapper">
        <img
          src={movie.poster}
          alt={movie.title}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />

        {/* Professional Hover Overlay */}
        <div className="movie-card-overlay">
          <div className="overlay-btn">View Details</div>
        </div>

        <div
          className={`movie-fav ${isFav ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(movie);
          }}
        >
          <Heart size={16} fill={isFav ? "currentColor" : "none"} />
        </div>

        <div className="movie-rating">
          <Star size={10} />
          {movie.rating}
        </div>
      </div>

      <div className="movie-info">
        <p className="movie-genre">{movie.genre.split("/")[0]}</p>
        <h3 className="movie-title">{movie.title}</h3>
      </div>
    </div>
  );
};

export default MovieCard;