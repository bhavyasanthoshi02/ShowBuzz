import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Star, Trophy, Gift, Coins, ChevronLeft, Sparkles, Music, Ticket, Film, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/gamification.css";

const Rewards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userCoins, setUserCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [rewardMsg, setRewardMsg] = useState("");

  const userId = user?.uid || "guest";

  useEffect(() => {
    // Load gamification data from localStorage
    const loadStats = () => {
      const stats = JSON.parse(localStorage.getItem(`showbuzz_stats_${userId}`) || "{}");
      const bookings = JSON.parse(localStorage.getItem(`showbuzz_bookings_${userId}`) || "[]");
      
      const coins = stats.coins || (bookings.length * 50);
      const currentStreak = stats.streak || Math.min(bookings.length, 5); // Mock streak logic
      
      setUserCoins(coins);
      setStreak(currentStreak);

      // Check for badges
      const earnedBadges = [];
      if (bookings.length > 0) earnedBadges.push("First Timer");
      if (bookings.length >= 5) earnedBadges.push("First Day First Show Fan");
      if (bookings.filter(b => b.isMusic || b.orderedFood?.some(f => f.includes("Concert"))).length >= 2) earnedBadges.push("Concert Lover");
      if (bookings.filter(b => b.isSport).length >= 2) earnedBadges.push("Stadium Regular");
      if (coins >= 500) earnedBadges.push("Buzz Millionaire");
      
      setBadges(earnedBadges);
    };

    loadStats();
  }, [userId]);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const extraDegree = Math.floor(Math.random() * 360) + 1440; // 4 full circles + random
    const newRotation = rotation + extraDegree;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const wonCoins = [50, 100, 20, 200, 10, 500, 5, 150][Math.floor(Math.random() * 8)];
      const newTotal = userCoins + wonCoins;
      setUserCoins(newTotal);
      
      // Save stats
      const stats = JSON.parse(localStorage.getItem(`showbuzz_stats_${userId}`) || "{}");
      localStorage.setItem(`showbuzz_stats_${userId}`, JSON.stringify({ ...stats, coins: newTotal }));

      setRewardMsg(`🎉 You won ${wonCoins} BuzzCoins!`);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }, 4000);
  };

  const BADGE_LIST = [
    { id: "First Day First Show Fan", icon: Film, desc: "Booked 5+ Movie Tickets" },
    { id: "Concert Lover", icon: Music, desc: "Attended 2+ Music Events" },
    { id: "Stadium Regular", icon: Ticket, desc: "Booked 2+ Sports Events" },
    { id: "Buzz Millionaire", icon: Coins, desc: "Accumulated 500+ Coins" },
    { id: "Social Star", icon: Star, desc: "Shared 3+ Booking Sessions" },
    { id: "High Roller", icon: Trophy, desc: "Single booking over ₹1000" }
  ];

  return (
    <div className="rewards-page" style={{ background: '#f6f7fb', minHeight: '100vh' }}>
      <Navbar />

      <div className="rewards-header">
        <button className="back-btn" onClick={() => navigate(-1)} style={{ position: 'absolute', top: '100px', left: '40px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
          <ChevronLeft size={18} /> Back
        </button>
        <p className="rewards-subtitle">BuzzRewards Program</p>
        <h1 className="rewards-title">My Reward Center</h1>
        <div className="coin-total">
          <Coins size={48} /> {userCoins}
        </div>
        <p className="rewards-subtitle">BuzzCoins available for redemption</p>
      </div>

      <div className="home-main">
        <div className="rewards-grid-container">
          {/* Left Side: Streak & Wheel */}
          <div className="rewards-left">
            <div className="streak-counter">
              <div className="streak-icon">
                <Flame size={24} fill="#ff4d4d" />
              </div>
              <div className="streak-info">
                <h4>{streak} Week Streak!</h4>
                <p>Keep booking to increase your multiplier</p>
              </div>
              <div style={{ marginLeft: 'auto', fontWeight: '900', color: '#ff4d4d', fontSize: '14px' }}>
                {streak * 1.2}x XP
              </div>
            </div>

            <div className="spin-wheel-card">
              <h3 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: '900' }}>Daily Spin & Win</h3>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Spin the wheel for bonus BuzzCoins!</p>
              
              <div className="wheel-container">
                <div className="wheel-pointer" />
                <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
                  {/* Wheel Slices Text */}
                  {[10, 50, 100, 20, 200, 10, 500, 0].map((val, i) => (
                    <div 
                      key={i} 
                      className="wheel-label" 
                      style={{ transform: `rotate(${i * 45 + 22.5}deg)` }}
                    >
                      <span>{val > 0 ? val : "💩"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="spin-button" 
                onClick={spinWheel} 
                disabled={isSpinning}
              >
                {isSpinning ? "Spinning..." : "SPIN NOW (10 Coins)"}
              </button>
            </div>
          </div>

          {/* Right Side: Badges */}
          <div className="rewards-right">
            <div className="badges-header">
              <h2 style={{ color: 'white' }}>My Badges</h2>
              <span className="badge-count">{badges.length} Unlocked</span>
            </div>

            <div className="badges-grid">
              {BADGE_LIST.map((b) => {
                const isUnlocked = badges.includes(b.id);
                const Icon = b.icon;
                return (
                  <div key={b.id} className={`badge-card ${isUnlocked ? "unlocked" : "locked"}`}>
                    <div className="badge-icon-wrap">
                      <Icon size={28} />
                      {isUnlocked && <Sparkles size={12} className="badge-sparkle" />}
                    </div>
                    <p className="badge-name">{b.id}</p>
                    <p className="badge-desc">{b.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Loyalty Levels */}
            <div className="loyalty-levels">
              <h3 className="loyalty-title">Loyalty Progress</h3>
              <div className="level-progress-bar">
                <div 
                  className="level-fill" 
                  style={{ width: `${(userCoins % 1000) / 10}%` }} 
                />
              </div>
              <div className="level-info">
                <span>Silver Member</span>
                <span className="next-level-target">{1000 - (userCoins % 1000)} Coins to Gold</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showCelebration && (
        <div className="celebration-toast">
          <div className="toast-icon" style={{ width: '40px', height: '40px', background: '#fff9ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f39c12' }}>
            <Zap size={20} fill="#f39c12" />
          </div>
          <div className="toast-content">
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>{rewardMsg}</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Coins added to your balance!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
