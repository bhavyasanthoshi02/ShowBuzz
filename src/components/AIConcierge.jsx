import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Brain, Calendar, Ticket, Zap, MessageSquare, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import moviesData from "../data/movies.json";
import sportsData from "../data/sports.json";
import musicData from "../data/music.json";
import { useNavigate } from "react-router-dom";
import "../styles/concierge.css";

const AIConcierge = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: "ai", text: "Hi! I'm your ShowBuzz AI Concierge. Ready to plan your perfect entertainment experience? 🍿" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const userId = user?.uid || "guest";

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Smart Notification logic
  useEffect(() => {
    const checkForSmartAlerts = () => {
      const history = JSON.parse(localStorage.getItem(`showbuzz_bookings_${userId}`) || "[]");
      if (history.length === 0) return;

      // Logic: If user books many Marvel/Action movies, suggest a new one
      const genres = history.map(b => b.movieGenre).filter(Boolean);
      const topGenre = genres.sort((a,b) => genres.filter(v => v===a).length - genres.filter(v => v===b).length).pop();
      
      if (topGenre && !localStorage.getItem("notified_ai_rec")) {
        setHasNotification(true);
      }
    };

    const timer = setTimeout(checkForSmartAlerts, 5000);
    return () => clearTimeout(timer);
  }, [userId]);

  const handleSend = (text = input) => {
    if (!text.trim()) return;

    const newMsg = { id: Date.now(), type: "user", text };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI logic
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: "ai", ...aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (text) => {
    const input = text.toLowerCase();
    const history = JSON.parse(localStorage.getItem(`showbuzz_bookings_${userId}`) || "[]");

    if (input.includes("mood") || input.includes("suggest") || input.includes("watch")) {
      // Analyze history for better personalization
      const genres = history.map(b => b.movieGenre?.split('/')[0]).filter(Boolean);
      const favoriteGenre = genres.length > 0 ? genres[0] : "Action";

      const allMovies = [...moviesData.telugu, ...moviesData.hindi, ...moviesData.tamil];
      const recommendations = allMovies
        .filter(m => m.genre.includes(favoriteGenre))
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(m => ({ ...m, type: 'movie' }));

      return {
        text: `Based on your love for ${favoriteGenre}, I think you'll really enjoy these! Shall I book the best seats for you?`,
        recommendations
      };
    }

    if (input.includes("music") || input.includes("concert") || input.includes("singer") || input.includes("arijit")) {
      const recommendations = musicData
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(m => ({ ...m, type: 'music' }));
      
      return {
        text: "I've found some amazing live performances for you! Nothing beats the energy of a concert. 🎤",
        recommendations
      };
    }

    if (input.includes("sport") || input.includes("match") || input.includes("game")) {
      const recommendations = sportsData
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(s => ({ ...s, type: 'sport' }));
      
      return {
        text: "Ready for some live action? Here are the top matches and sports events happening near you! 🏟️",
        recommendations
      };
    }

    if (input.includes("seat") || input.includes("predict")) {
      const lastBooking = history[0];
      if (lastBooking && lastBooking.seats) {
        const pref = lastBooking.seats[0][0]; // Row initial
        return { text: `I noticed you usually prefer Row ${pref} (the sweet spot!). I'll prioritize those for your next booking. 🔮` };
      }
      return { text: "I'm still learning your seating preferences. Book a few more shows and I'll start predicting the best spots for you!" };
    }

    if (input.includes("marvel") || input.includes("action")) {
        const actionMovies = moviesData.hindi.filter(m => m.genre.includes("Action")).slice(0, 2);
        return {
            text: "Action-packed choice! Here's what's trending in your favorite genre:",
            recommendations: actionMovies.map(m => ({ ...m, type: 'movie' }))
        };
    }

    if (input.includes("reward") || input.includes("coin") || input.includes("badge")) {
        const stats = JSON.parse(localStorage.getItem(`showbuzz_stats_${userId}`) || "{}");
        const coins = stats.coins || 0;
        return { 
            text: `You currently have ${coins} BuzzCoins! 🪙 You can spend them on 'Spin the Wheel' or unlock exclusive badges. Shall I take you to the Reward Center?`,
            recommendations: [{ title: "Go to Reward Center", poster: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=400&q=80", genre: "Gamification", rating: 5, type: 'rewards' }]
        };
    }

    return { text: "I can help you find movies, concerts, or sports events based on your mood. I can also predict your favorite seats or check your BuzzRewards balance. What's on your mind?" };
  };

  const toggleConcierge = () => {
    setIsOpen(!isOpen);
    setHasNotification(false);
  };

  return (
    <>
      <button 
        className={`concierge-fab ${isOpen ? "active" : ""}`} 
        onClick={toggleConcierge}
        title="AI Assistant"
      >
        {isOpen ? <X size={28} /> : <Sparkles size={28} className="concierge-ai-icon" />}
        {hasNotification && <span className="smart-notification-dot" />}
      </button>

      {isOpen && (
        <div className="concierge-modal">
          <div className="concierge-header">
            <div className="concierge-avatar">
              <Brain size={24} color="white" />
            </div>
            <div className="concierge-title">
              <h3>ShowBuzz AI</h3>
              <p>Online • Personal Concierge</p>
            </div>
            <button className="concierge-close" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="concierge-body">
            {messages.map(msg => (
              <div key={msg.id} className="concierge-msg-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={`concierge-msg ${msg.type}`}>
                  {msg.text}
                </div>
                {msg.recommendations && (
                  <div className="concierge-recommendations">
                    {msg.recommendations.map(rec => (
                      <div key={rec.id || rec.title} className="concierge-rec-card" onClick={() => {
                        if (rec.type === 'movie') navigate(`/movie/${encodeURIComponent(rec.title)}`);
                        else if (rec.type === 'music') navigate(`/music-detail/${rec.id}`);
                        else if (rec.type === 'sport') navigate(`/sports-detail/${rec.id}`);
                        else if (rec.type === 'rewards') navigate(`/rewards`);
                      }}>
                        <img src={rec.poster} alt={rec.title} className="concierge-rec-img" />
                        <div className="concierge-rec-info">
                          <p className="concierge-rec-title">{rec.title}</p>
                          <p className="concierge-rec-meta">{rec.category || rec.genre} • ⭐ {rec.rating}</p>
                        </div>
                        <Zap size={14} color="#f84464" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="concierge-msg ai">
                <div className="typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
            
            {messages.length === 1 && (
              <div className="concierge-options">
                <button className="concierge-opt-btn" onClick={() => handleSend("Suggest something based on my mood")}>🎭 Suggest by Mood</button>
                <button className="concierge-opt-btn" onClick={() => handleSend("Show me my rewards and coins")}>🪙 My Rewards</button>
                <button className="concierge-opt-btn" onClick={() => handleSend("Show me trending Music events")}>🎤 Music & Concerts</button>
              </div>
            )}
          </div>

          <div className="concierge-input-area">
            <input 
              className="concierge-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="concierge-send" onClick={() => handleSend()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIConcierge;
