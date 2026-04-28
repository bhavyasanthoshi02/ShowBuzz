import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Heart, User, Bell, X, ChevronRight, Ticket, BookOpen, HelpCircle, Settings, Gift, LogOut, Coins } from "lucide-react";
import LocationModal from "./LocationModal";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, signOut } from "../firebase";
import moviesData from "../data/movies.json";
import sportsData from "../data/sports.json";
import musicData from "../data/music.json";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

const MENU_ITEMS = [
  { icon: Heart,     label: "Watchlist",           sub: "Movies & events you saved" },
  { icon: Ticket,    label: "Your Bookings",       sub: "View all your tickets & purchases" },
  { icon: Bell,      label: "Notifications",        sub: "Stay updated with latest alerts" },
  { icon: BookOpen,  label: "Stream Library",       sub: "Rented & Purchased Movies" },
  { icon: HelpCircle,label: "Help & Support",       sub: "View commonly asked queries" },
  { icon: Settings,  label: "Accounts & Settings",  sub: "Location, Payments & More" },
  { icon: Gift,      label: "Rewards",              sub: "View your rewards & unlock new ones" },
];

const Navbar = ({ favorites, onSearch }) => {
  const navigate = useNavigate();
  const locationPath = useLocation().pathname;
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(localStorage.getItem("location") || "Select City");
  const [showModal, setShowModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Guest";
  const initial = displayName.charAt(0).toUpperCase();

  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (val) => {
    setQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    const allEvents = [
      ...Object.values(moviesData).flat().map(m => ({ ...m, type: "movie" })),
      ...sportsData.map(s => ({ ...s, type: "sport" })),
      ...musicData.map(m => ({ ...m, type: "music" }))
    ];

    const filtered = allEvents.filter(e => 
      e.title.toLowerCase().includes(val.toLowerCase()) || 
      e.category?.toLowerCase().includes(val.toLowerCase()) ||
      e.genre?.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 6);

    setSearchResults(filtered);
    if (onSearch) onSearch(val);
  };

  const navigateToResult = (res) => {
    setQuery("");
    setSearchResults([]);
    if (res.type === "movie") navigate(`/movie/${encodeURIComponent(res.title)}`);
    else if (res.type === "sport") navigate(`/sports-detail/${res.id}`);
    else if (res.type === "music") navigate(`/music-detail/${res.id}`);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (!e.target.closest(".home-search")) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowProfile(false);
    navigate("/logout");
  };

  const isHome = locationPath === "/home" || locationPath === "/";
  const isMovie = locationPath.startsWith("/movie") || locationPath === "/movies"; 
  const alwaysScrolled = !isHome; 

  return (
    <>
      <nav className={`home-navbar ${scrolled || alwaysScrolled ? "scrolled" : ""}`}>
        <div className="home-navbar-left">
          <h1 className="home-logo" onClick={() => navigate("/home")} style={{cursor: "pointer"}}>
            ShowBuzz
          </h1>

          <div className="home-links">
            <span
              className={`home-link ${isHome ? "active" : ""}`}
              onClick={() => navigate("/home")}
              style={{cursor: "pointer"}}
            >
              Home
            </span>
            <span
              className={`home-link ${isMovie ? "active" : ""}`}
              onClick={() => navigate("/movies")}
              style={{cursor: "pointer"}}
            >
              Movies
            </span>
            <span
              className={`home-link ${locationPath === "/sports" || locationPath.startsWith("/sports-detail") ? "active" : ""}`}
              onClick={() => navigate("/sports")}
              style={{cursor: "pointer"}}
            >
              Sports
            </span>
            <span
              className={`home-link ${locationPath === "/music" || locationPath.startsWith("/music-detail") ? "active" : ""}`}
              onClick={() => navigate("/music")}
              style={{cursor: "pointer"}}
            >
              Music
            </span>
            <span 
              className={`home-link ${locationPath === "/bookings" ? "active" : ""}`} 
              onClick={() => navigate("/bookings")} 
              style={{cursor:"pointer"}}
            >
              Bookings
            </span>
          </div>
        </div>

        <div className="home-navbar-right">
          <div className="home-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search for Movies, Sports, Events..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map(res => (
                   <div key={res.id || res.title} className="search-result-item" onClick={() => navigateToResult(res)}>
                    <img src={res.poster} alt={res.title} />
                    <div>
                      <p className="res-title">{res.title}</p>
                      <p className="res-meta">{res.type.toUpperCase()} • {res.category || res.genre}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="nav-icon" onClick={() => setShowModal(true)}>
            <MapPin size={18} />
            <span>{location}</span>
          </div>

          <div className="nav-icon nav-fav-wrapper" onClick={() => navigate("/rewards")} style={{cursor:'pointer', marginRight: '5px'}}>
            <div className="coin-badge">
              <Coins size={16} />
              <span>
                {(() => {
                  try {
                    const stats = JSON.parse(localStorage.getItem(`showbuzz_stats_${user?.uid || "guest"}`) || "{}");
                    return stats.coins || 0;
                  } catch (e) {
                    return 0;
                  }
                })()}
              </span>
            </div>
          </div>

          <div className="nav-icon nav-fav-wrapper" onClick={() => navigate("/favorites")} style={{cursor:'pointer'}}>
            <Heart size={20} />
            {favorites?.length > 0 && (
              <span className="nav-fav-badge">{favorites.length}</span>
            )}
          </div>

          <div
            className="nav-profile"
            onClick={() => setShowProfile((v) => !v)}
          >
            {initial}
          </div>
        </div>
      </nav>

      {/* Profile Slide Panel */}
      {showProfile && (
        <div className="profile-panel-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-panel" ref={profileRef} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="profile-panel-header">
              <div className="profile-panel-avatar">{initial}</div>
              <div className="profile-panel-info">
                <p className="profile-panel-hey">Hey!</p>
                <p className="profile-panel-name">{displayName}</p>
              </div>
              <button className="profile-panel-close" onClick={() => setShowProfile(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Menu */}
            <div className="profile-panel-menu">
              {MENU_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div 
                  className="profile-menu-item" 
                  key={label}
                  onClick={() => {
                    if (label === "Watchlist") navigate("/favorites");
                    if (label === "Your Bookings") navigate("/bookings");
                    if (label === "Rewards") navigate("/rewards");
                    setShowProfile(false);
                  }}
                >
                  <div className="profile-menu-icon"><Icon size={20} /></div>
                  <div className="profile-menu-text">
                    <p className="profile-menu-label">{label}</p>
                    <p className="profile-menu-sub">{sub}</p>
                  </div>
                  <ChevronRight size={16} className="profile-menu-arrow" />
                </div>
              ))}
            </div>

            {/* Sign Out */}
            <div className="profile-panel-footer">
              <button className="profile-signout-btn" onClick={handleLogout}>
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <LocationModal
          onClose={() => setShowModal(false)}
          setLocation={setLocation}
        />
      )}
    </>
  );
};

export default Navbar;