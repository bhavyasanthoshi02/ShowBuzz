import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import HeroCarousel from "../components/HeroCarousel";
import movieData from "../data/movies.json";
import sportsData from "../data/sports.json";
import musicData from "../data/music.json";
import SportsCard from "../components/SportsCard";
import MusicCard from "../components/MusicCard";
import { Sparkles } from "lucide-react";
import Footer from "../components/Footer";
import { auth } from "../firebase";
import "../styles/home.css";


const Home = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() => {
    const savedFavs = localStorage.getItem("showbuzz_favorites");
    return savedFavs ? JSON.parse(savedFavs) : [];
  });
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem("location") || "Select City");

  useEffect(() => {
    const handleStorage = () => {
      setSelectedCity(localStorage.getItem("location") || "Select City");
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(handleStorage, 1000); 
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);


  // Merge all movies from all languages
  const allMovies = [
    ...(movieData.telugu || []),
    ...(movieData.hindi || []),
    ...(movieData.tamil || [])
  ];

  // Helper to filter by city
  const filterByCity = (list) => {
    if (selectedCity === "Select City" || !selectedCity) return list;
    return list.filter(item => 
      item.venue?.toLowerCase().includes(selectedCity.toLowerCase()) ||
      item.location?.toLowerCase().includes(selectedCity.toLowerCase())
    );
  };

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

  const searchFiltered = allMovies.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.genre.toLowerCase().includes(search.toLowerCase())
  );

  const getCategory = (cat) => {
    if (cat === "Trending") return [...searchFiltered].sort((a, b) => b.rating - a.rating).slice(0, 10);
    if (cat === "Recommended") return [...searchFiltered].sort(() => Math.random() - 0.5).slice(0, 10);
    if (cat === "Upcoming") return searchFiltered.filter(m => m.status === "Upcoming").slice(0, 10);
    return searchFiltered.slice(0, 10);
  };

  const heroSlides = [
    ...(allMovies.slice(0, 5).map(m => ({ ...m, type: "movie" }))),
    ...(sportsData.slice(0, 2).map(s => ({ ...s, type: "sport" }))),
    ...(musicData.slice(0, 2).map(m => ({ ...m, type: "music" })))
  ].sort(() => Math.random() - 0.5);

  return (
    <div className="home-container">
      <Navbar favorites={favorites} onSearch={setSearch} />

      <HeroCarousel items={heroSlides} />

      <div className="home-main">
        {/* Filters removed as per user request */}

        {/* Dynamic Sections */}
        {["AI Curated", "Trending", "Recommended", "Action", "Sports", "Comedy", "Music", "Drama", "Upcoming"].map((cat, idx) => {
          let mixedContent = [];
          
          if (cat === "AI Curated") {
            const history = JSON.parse(localStorage.getItem(`showbuzz_bookings_${auth.currentUser?.uid || "guest"}`) || "[]");
            if (history.length === 0) return null;
            
            // Personalization logic: Recommend movies of same genre as top booking
            const topGenre = history[0].movieGenre?.split('/')[0] || "Action";
            mixedContent = allMovies
              .filter(m => m.genre.includes(topGenre))
              .sort(() => 0.5 - Math.random())
              .slice(0, 8)
              .map(m => ({ ...m, type: 'movie' }));
          } else if (cat === "Sports") {
            mixedContent = sportsData.map(s => ({ ...s, type: 'sport' }));
          } else if (cat === "Music") {
            mixedContent = musicData.map(m => ({ ...m, type: 'music' }));
          } else if (["Action", "Comedy", "Drama"].includes(cat)) {
            mixedContent = allMovies.filter(m => m.genre.includes(cat)).map(m => ({ ...m, type: 'movie' }));
          } else {
            const sectionMovies = getCategory(cat).map(m => ({ ...m, type: 'movie' }));
            mixedContent = [...sectionMovies];
            if (cat === "Trending") {
              mixedContent = [
                ...sectionMovies.slice(0, 4),
                ...sportsData.slice(0, 2).map(s => ({ ...s, type: 'sport' })),
                ...musicData.slice(0, 2).map(m => ({ ...m, type: 'music' })),
                ...sectionMovies.slice(4)
              ];
            } else if (cat === "Recommended") {
              mixedContent = [
                ...sectionMovies.slice(0, 4),
                ...musicData.slice(2, 4).map(m => ({ ...m, type: 'music' })),
                ...sportsData.slice(2, 4).map(s => ({ ...s, type: 'sport' })),
                ...sectionMovies.slice(4)
              ];
            } else if (cat === "Upcoming") {
              mixedContent = [
                ...sectionMovies.slice(0, 4),
                ...sportsData.slice(4, 6).map(s => ({ ...s, type: 'sport' })),
                ...musicData.slice(4, 6).map(m => ({ ...m, type: 'music' })),
                ...sectionMovies.slice(4)
              ];
            }
          }

          if (mixedContent.length === 0) return null;

          return (
            <div className="movie-section" key={cat}>
              <div className="section-header">
                <div>
                  <p className="section-label">
                    {cat === "AI Curated" ? "AI POWERED" :
                     cat === "Trending" ? "TOP RATED" : 
                     cat === "Recommended" ? "FOR YOU" : 
                     cat === "Sports" ? "LIVE ACTION" : 
                     cat === "Music" ? "LIVE CONCERTS" : 
                     cat === "Action" ? "HIGH ENERGY" :
                     cat === "Comedy" ? "LAUGH OUT LOUD" :
                     cat === "Drama" ? "DEEP STORIES" :
                     "NEXT MONTH"}
                  </p>
                  <h2 className="section-title">
                    {cat === "AI Curated" ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles size={24} style={{ color: '#f84464' }} /> AI Curated Picks
                      </span>
                    ) :
                     cat === "Trending" ? "Trending Now" : 
                     cat === "Recommended" ? "Recommended For You" : 
                     cat === "Sports" ? "Sports Fever" : 
                     cat === "Music" ? "Music & Concerts" : 
                     cat === "Upcoming" ? "Upcoming Events" : 
                     `${cat} Favorites`}
                  </h2>
                </div>
                <span className="view-all" onClick={() => {
                  if (cat === "Sports") navigate("/sports");
                  else if (cat === "Music") navigate("/music");
                  else navigate("/movies");
                }} style={{cursor: "pointer"}}>View all &rarr;</span>
              </div>

              <div className="movie-row-container no-scrollbar">
                {mixedContent.map((item, i) => {
                  if (item.type === 'sport') {
                    return <SportsCard key={`s-${item.id}-${idx}`} event={item} favorites={favorites} toggleFavorite={toggleFavorite} />;
                  } else if (item.type === 'music') {
                    return <MusicCard key={`m-${item.id}-${idx}`} event={item} favorites={favorites} toggleFavorite={toggleFavorite} />;
                  } else {
                    return (
                      <MovieCard
                        key={`mov-${item.title}-${i}-${idx}`}
                        movie={item}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                      />
                    );
                  }
                })}
              </div>
            </div>
          );
        })}

        {searchFiltered.length === 0 && (
          <div className="empty-state">
            <h3>No movies found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;