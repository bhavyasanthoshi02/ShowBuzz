import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MusicCard from "../components/MusicCard";
import musicData from "../data/music.json";
import { Music as MusicLucide } from "lucide-react";
import Footer from "../components/Footer";
import "../styles/movies.css";

const Music = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("showbuzz_favorites") || "[]");
    setFavorites(saved);
  }, []);

  const toggleFavorite = (event) => {
    const exists = favorites.find((m) => m.title === event.title);
    let newFavs;
    if (exists) {
      newFavs = favorites.filter((m) => m.title !== event.title);
    } else {
      newFavs = [...favorites, event];
    }
    setFavorites(newFavs);
    localStorage.setItem("showbuzz_favorites", JSON.stringify(newFavs));
  };

  const categories = ["All", "Bollywood", "EDM", "Punjabi", "Pop/Rock", "Indie"];

  const filteredMusic = musicData.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.venue.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || m.category.includes(activeCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="movies-page">
      <Navbar favorites={favorites} onSearch={setSearch} />
      
      <div className="movies-container">
        <div className="movies-header">
          <div className="movies-header-left">
            <h1>Music Concerts</h1>
            <p>Experience the rhythm of live performances</p>
          </div>
        </div>

        <div className="movies-filters">
          <div className="filter-row">
            <span className="filter-label">Genre</span>
            <div className="filter-options">
              {categories.map(c => (
                <button 
                  key={c}
                  className={`filter-btn ${activeCategory === c ? "active" : ""}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredMusic.length === 0 ? (
          <div className="movies-no-results">
            <div className="no-results-icon"><MusicLucide size={64} /></div>
            <h2>No concerts found</h2>
            <p>We couldn't find any music events matching your search.</p>
            <button className="filter-btn active" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
              View All Concerts
            </button>
          </div>
        ) : (
          <div className="movies-grid">
            {filteredMusic.map((m) => (
              <MusicCard key={m.id} event={m} favorites={favorites} toggleFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Music;
