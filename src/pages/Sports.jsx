import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SportsCard from "../components/SportsCard";
import sportsData from "../data/sports.json";
import { Trophy } from "lucide-react";
import Footer from "../components/Footer";
import "../styles/movies.css";

const Sports = () => {
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

  const categories = ["All", "Cricket", "Football", "Kabaddi"];

  const filteredSports = sportsData.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.venue.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || s.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="movies-page">
      <Navbar favorites={favorites} onSearch={setSearch} />
      
      <div className="movies-container">
        <div className="movies-header">
          <div className="movies-header-left">
            <h1>Sports Events</h1>
            <p>Catch the live action of your favorite sports</p>
          </div>
        </div>

        <div className="movies-filters">
          <div className="filter-row">
            <span className="filter-label">Sport</span>
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

        {filteredSports.length === 0 ? (
          <div className="movies-no-results">
            <div className="no-results-icon"><Trophy size={64} /></div>
            <h2>No events found</h2>
            <p>We couldn't find any sports events matching your search.</p>
            <button className="filter-btn active" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
              View All Events
            </button>
          </div>
        ) : (
          <div className="movies-grid">
            {filteredSports.map((s) => (
              <SportsCard key={s.id} event={s} favorites={favorites} toggleFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Sports;
