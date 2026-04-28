import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Film } from "lucide-react";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import SportsCard from "../components/SportsCard";
import MusicCard from "../components/MusicCard";
import "../styles/home.css";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavs = localStorage.getItem("showbuzz_favorites");
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
  }, []);

  const toggleFavorite = (item) => {
    const updated = favorites.filter((m) => m.title !== item.title);
    setFavorites(updated);
    localStorage.setItem("showbuzz_favorites", JSON.stringify(updated));
  };

  return (
    <div className="home-container">
      <Navbar favorites={favorites} />
      
      <div className="home-main" style={{ marginTop: "100px" }}>
        <div className="section-header">
          <div>
            <p className="section-label">Saved for Later</p>
            <h2 className="section-title">Your Wishlist</h2>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state" style={{ textAlign: "center", padding: "100px 0" }}>
            <Heart size={60} color="#ddd" style={{ marginBottom: "20px" }} />
            <h3 style={{ color: "#888" }}>Your wishlist is empty</h3>
            <p style={{ color: "#aaa", marginBottom: "30px" }}>Start adding events you want to watch!</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate("/home")}
              style={{ margin: "0 auto" }}
            >
              Explore Sports, Movies and Music
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" }}>
            {favorites.map((item, i) => {
              // Decide which card to render
              // Sports/Music items have 'id' starting with 's' or 'm' and use 'category'
              // Movies use 'genre' and don't necessarily have 'id' formatted this way
              if (item.id?.startsWith("s")) {
                return <SportsCard key={i} event={item} favorites={favorites} toggleFavorite={toggleFavorite} />;
              }
              if (item.id?.startsWith("m")) {
                return <MusicCard key={i} event={item} favorites={favorites} toggleFavorite={toggleFavorite} />;
              }
              return (
                <MovieCard
                  key={i}
                  movie={item}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
