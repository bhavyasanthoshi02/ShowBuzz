import { MapPin, Calendar, Music as MusicIcon, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const MusicCard = ({ event, favorites, toggleFavorite }) => {
  const navigate = useNavigate();
  const isFavorite = favorites?.some((m) => m.title === event.title);

  return (
    <div className="movie-card sports-card music-card" onClick={() => navigate(`/music-detail/${event.id}`)} style={{cursor: "pointer"}}>
      <div className="movie-card-img-wrapper">
        <img
          src={event.poster}
          alt={event.title}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x450?text=Music+Concert";
          }}
        />

        <div 
          className={`movie-fav ${isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(event);
          }}
        >
          <Heart size={18} fill={isFavorite ? "var(--home-primary)" : "none"} />
        </div>
        
        <div className={`movie-rating ${event.status === "Sold Out" ? "sold-out" : ""}`}>
          {event.status}
        </div>

        <div className="movie-card-hover">
          <button 
            className={`btn-book ${event.status === "Sold Out" || event.status === "Upcoming" ? "disabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (event.status !== "Sold Out" && event.status !== "Upcoming") {
                navigate(`/book-music/${event.id}`);
              }
            }}
          >
            {event.status === "Sold Out" ? "Sold Out" : event.status === "Upcoming" ? "Stay Tuned" : "Book Tickets"}
          </button>
        </div>
      </div>

      <div className="movie-info">
        <div className="sports-meta-top">
          <span className="movie-genre">{event.category}</span>
          <span className="sports-price">₹{event.price} onwards</span>
        </div>
        <h3 className="movie-title">{event.title}</h3>
        <div className="sports-details">
          <p><Calendar size={12} /> {event.date}</p>
          <p><MapPin size={12} /> {event.venue.split(",")[0]}</p>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
