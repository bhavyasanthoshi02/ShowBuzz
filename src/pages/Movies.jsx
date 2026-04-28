import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import moviesData from "../data/movies.json";
import { Film } from "lucide-react";
import Footer from "../components/Footer";
import "../styles/movies.css";

const Movies = () => {
  const [language, setLanguage] = useState("telugu");
  const [activeGenre, setActiveGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("showbuzz_favorites") || "[]");
    setFavorites(saved);
  }, []);

  const toggleFavorite = (movie) => {
    const exists = favorites.find((m) => m.title === movie.title);
    let newFavs;
    if (exists) {
      newFavs = favorites.filter((m) => m.title !== movie.title);
    } else {
      newFavs = [...favorites, movie];
    }
    setFavorites(newFavs);
    localStorage.setItem("showbuzz_favorites", JSON.stringify(newFavs));
  };

  const movies = moviesData[language] || [];
  
  // Get unique genres for the selected language
  const genres = ["All", ...new Set(movies.map(m => m.genre.split("/")[0]))];

  const filteredMovies = movies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = activeGenre === "All" || m.genre.includes(activeGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="movies-page">
      <Navbar favorites={favorites} onSearch={setSearch} />
      
      <div className="movies-container">
        <div className="movies-header">
          <div className="movies-header-left">
            <h1>All Movies</h1>
            <p>Explore the latest releases in your favorite languages</p>
          </div>
        </div>

        <div className="movies-filters">
          <div className="filter-row">
            <span className="filter-label">Language</span>
            <div className="filter-options">
              {["telugu", "hindi", "tamil"].map(l => (
                <button 
                  key={l}
                  className={`filter-btn ${language === l ? "active" : ""}`}
                  onClick={() => { setLanguage(l); setActiveGenre("All"); }}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">Genre</span>
            <div className="filter-options">
              {genres.map(g => (
                <button 
                  key={g}
                  className={`filter-btn ${activeGenre === g ? "active" : ""}`}
                  onClick={() => setActiveGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="movies-no-results">
            <div className="no-results-icon"><Film size={64} /></div>
            <h2>No movies found</h2>
            <p>We couldn't find any movies matching your selection.</p>
            <button className="filter-btn active" onClick={() => { setSearch(""); setActiveGenre("All"); }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="movies-grid">
            {filteredMovies.map((m, i) => (
              <MovieCard 
                key={i} 
                movie={m} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Movies;
