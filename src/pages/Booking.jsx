import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar, Star, Check, Ticket, X, CheckCircle, Home, Users, Send } from "lucide-react";
import { auth, db } from "../firebase";
import moviesData from "../data/movies.json";
import SeatSelection from "../components/SeatSelection";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import "../styles/booking.css";

// ---------- Static Data ----------
const THEATERS = [
  { id: 1, name: "PVR Cinemas – INOX Forum", area: "Banjara Hills", distance: "2.1 km", shows: ["10:00 AM","01:15 PM","04:30 PM","07:45 PM","10:30 PM"], tags: ["4K Dolby","M-Ticket"] },
  { id: 2, name: "Cinepolis – GVK One Mall",  area: "Banjara Hills", distance: "3.4 km", shows: ["09:30 AM","12:45 PM","03:30 PM","06:45 PM","09:50 PM"], tags: ["IMAX","M-Ticket"] },
  { id: 3, name: "AMB Cinemas",               area: "Gachibowli",   distance: "5.2 km", shows: ["10:30 AM","01:45 PM","05:00 PM","08:15 PM"],            tags: ["4K"] },
  { id: 4, name: "INOX – GVK One",            area: "Punjagutta",   distance: "4.8 km", shows: ["11:00 AM","02:15 PM","05:30 PM","08:45 PM","11:00 PM"], tags: ["M-Ticket"] },
  { id: 5, name: "Prasads Multiplex",         area: "Tank Bund",    distance: "6.1 km", shows: ["09:00 AM","12:00 PM","03:15 PM","06:30 PM","09:45 PM"], tags: ["4DX","Dolby"] },
];

const SEAT_LAYOUT = {
  "RECLINER":  { price: 450, rows: ["A","B"],             cols: 8,  gap: [4] },
  "PREMIUM":   { price: 280, rows: ["C","D","E","F"],      cols: 12, gap: [6] },
  "EXECUTIVE": { price: 200, rows: ["G","H","I","J","K"],  cols: 14, gap: [7] },
  "NORMAL":    { price: 150, rows: ["L","M","N","O","P"],  cols: 16, gap: [4,12] },
};

const UNAVAILABLE = new Set(["A3","A7","B2","B6","C4","C9","D1","D11","E5","F3","F8","G2","G10","H4","H12","I6","J1","J9","K7","L3","L14","M5","M11","N2","N8","O4","O13","P6","P10"]);

// ---------- Component ----------
export default function Booking() {
  const { title } = useParams();
  const navigate  = useNavigate();
  const location = useLocation();
  const decodedTitle = decodeURIComponent(title);

  const [movie, setMovie] = useState(null);
  const [step,  setStep]  = useState(1); // 1=date/theater, 2=seats, 3=summary
  const [sessionId, setSessionId] = useState(null);
  const [isCollab, setIsCollab] = useState(false);

  const user = auth.currentUser;
  const userId = user?.uid || "guest";
  const userName = user?.displayName || user?.email?.split('@')[0] || "Guest";

  // Generate 7 days dynamically on component mount
  const DATES = React.useMemo(() => {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); 
      d.setDate(d.getDate() + i);
      return { label: days[d.getDay()], date: d.getDate(), month: months[d.getMonth()], full: d };
    });
  }, []);

  // Step 1
  const [selectedDate,    setSelectedDate]    = useState(0);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedShow,    setSelectedShow]    = useState(null);

  // "How many seats?" modal
  const [showSeatCountModal, setShowSeatCountModal] = useState(false);
  const [seatCount, setSeatCount] = useState(2);

  // Step 2
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Payment & Food
  const [showSnackPrompt, setShowSnackPrompt] = useState(false);
  const [selectedFood, setSelectedFood] = useState({}); // { itemId: qty }
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [bookedTicket, setBookedTicket] = useState(null);
  const [reactionToast, setReactionToast] = useState({ show: false, emoji: "" });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [deliveryPreference, setDeliveryPreference] = useState("interval"); // 'start' or 'interval'

  const FOOD_MENU = [
    { id: "f1", name: "Large Salted Popcorn", desc: "Fresh & crispy", price: 150, image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&w=200&q=80" },
    { id: "f2", name: "Cheese Popcorn", desc: "Loaded with cheddar", price: 180, image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=200&q=80" },
    { id: "f3", name: "Caramel Popcorn", desc: "Sweet & crunchy", price: 200, image: "https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=200" },
    { id: "f4", name: "Nachos with Salsa", desc: "Crunchy tortillas", price: 160, image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=200&q=80" },
    { id: "f5", name: "Samosa (2 pcs)", desc: "Hot & spicy", price: 60, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=80" },
    { id: "f6", name: "Classic Burger", desc: "Juicy chicken patty", price: 140, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80" },
    { id: "f7", name: "Pizza Slice", desc: "Cheesy delight", price: 130, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80" },
    { id: "f8", name: "French Fries", desc: "Golden & crispy", price: 100, image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=200&q=80" },
    { id: "f9", name: "Hot Dog", desc: "Classic chicken sausage", price: 120, image: "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=200&q=80" },
    { id: "f10", name: "Coke (750ml)", desc: "Chilled fountain drink", price: 100, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=200&q=80" },
    { id: "f11", name: "Cold Coffee", desc: "Classic frappe", price: 130, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=200&q=80" },
    { id: "f12", name: "Lemon Iced Tea", desc: "Refreshing cooler", price: 90, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=200&q=80" },
  ];

  useEffect(() => {
    for (const lang of Object.values(moviesData)) {
      const m = lang.find((m) => m.title === decodedTitle);
      if (m) { setMovie(m); break; }
    }
  }, [decodedTitle]);

  // Check for session in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session = params.get("session");
    if (session) {
      setSessionId(session);
      setIsCollab(true);
      setStep(2); // Jump to seat selection
    }
  }, [location]);

  const startCollabSession = () => {
    const id = "session_" + Math.random().toString(36).substr(2, 9);
    setSessionId(id);
    setIsCollab(true);
    setStep(2);
  };

  if (!movie) return <div className="bk-loading">Loading...</div>;

  // ---- Seat helpers ----
  const toggleSeat = (id) => {
    if (UNAVAILABLE.has(id)) return;
    setSelectedSeats((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= seatCount) return prev; // respect seat count
      return [...prev, id];
    });
  };

  const getSeatPrice = (id) => {
    const row = id[0];
    for (const [cat, info] of Object.entries(SEAT_LAYOUT)) {
      if (info.rows.includes(row)) return info.price;
    }
    return 0;
  };

  const totalAmount = selectedSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 25 : 0;

  // ---- Step labels ----
  const steps = ["Select Date & Theatre","Select Seats","Summary & Payment"];

  // Category availability labels
  const catStatus = { "RECLINER": "AVAILABLE", "PREMIUM": "AVAILABLE", "EXECUTIVE": "AVAILABLE", "NORMAL": "FILLING FAST" };
  const catStatusColor = { "RECLINER": "#2ecc71", "PREMIUM": "#2ecc71", "EXECUTIVE": "#2ecc71", "NORMAL": "#f39c12" };

  const foodTotal = Object.entries(selectedFood).reduce((sum, [id, qty]) => {
    const item = FOOD_MENU.find(f => f.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // ---- Payment handler ----
  const handlePayNow = () => {
    setShowSnackPrompt(true);
  };

  const saveReaction = (emoji) => {
    const allReactions = JSON.parse(localStorage.getItem("showbuzz_reactions") || "{}");
    const movieReactions = allReactions[movie.title] || [];
    allReactions[movie.title] = [...movieReactions, { emoji, userName, userId, createdAt: Date.now() }];
    localStorage.setItem("showbuzz_reactions", JSON.stringify(allReactions));
    
    setReactionToast({ show: true, emoji });
    setTimeout(() => setReactionToast({ show: false, emoji: "" }), 3000);
  };

  const applyCoupon = () => {
    const saved = JSON.parse(localStorage.getItem(`showbuzz_bookings_${userId}`) || "[]");
    const movieSpend = saved.filter(b => !b.isSport && !b.isMusic).reduce((sum, b) => sum + b.totalAmount, 0);
    const points = Math.floor(saved.reduce((sum, b) => sum + b.totalAmount, 0) / 10);
    
    let disc = 0;
    let code = couponCode.toUpperCase();
    
    if (code === "MOVIE20" && movieSpend > 1000) {
      disc = (totalAmount + convenienceFee) * 0.2;
      setAppliedCoupon({ code, discount: "20%" });
    } else if (code === "BUZZ10" && points > 200) {
      disc = (totalAmount + convenienceFee) * 0.1;
      setAppliedCoupon({ code, discount: "10%" });
    } else {
      alert("Invalid coupon or requirements not met.");
      return;
    }
    setDiscountAmount(disc);
  };

  const finalizeBooking = () => {
    const bookingId = "SB" + Date.now().toString().slice(-8);
    const orderedFood = Object.entries(selectedFood)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = FOOD_MENU.find(f => f.id === id);
        return `${item.name} x${qty}`;
      });
    const storageKey = user ? `showbuzz_bookings_${user.uid}` : "showbuzz_bookings_guest";

    const ticket = {
      id: bookingId,
      bookingId,
      movieTitle: movie.title,
      moviePoster: movie.poster,
      movieGenre: movie.genre,
      movieDuration: movie.duration,
      theater: selectedTheater?.name,
      theaterArea: selectedTheater?.area,
      date: `${DATES[selectedDate].label}, ${DATES[selectedDate].date} ${DATES[selectedDate].month}`,
      show: selectedShow,
      seats: selectedSeats,
      seatCount,
      totalAmount: totalAmount + convenienceFee + foodTotal,
      baseAmount: totalAmount,
      convenienceFee,
      foodAmount: foodTotal,
      orderedFood,
      deliveryPreference,
      deliveryStatus: "Preparing", // Initial live status
      createdAt: Date.now(),
    };
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    localStorage.setItem(storageKey, JSON.stringify([ticket, ...existing]));
    setBookedTicket(ticket);
    setPaymentSuccess(true);
    setShowTicket(true);
  };

  const updateFoodQty = (id, delta) => {
    setSelectedFood(prev => {
      const newQty = (prev[id] || 0) + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: newQty };
    });
  };

  return (
    <div className="bk-page">
      {/* ── Top Bar ── */}
      <div className="bk-topbar">
        <button className="bk-back" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
          <ChevronLeft size={20} /> Back
        </button>

        <div className="bk-topbar-center">
          <h2 className="bk-movie-title">{movie.title}</h2>
          <div className="bk-movie-meta">
            <Star size={12} fill="#f84464" color="#f84464" /> {movie.rating}/10
            &nbsp;•&nbsp;{movie.duration}&nbsp;•&nbsp;{movie.genre}
          </div>
        </div>

        <div className="bk-steps">
          {steps.map((s, i) => (
            <div key={i} className={`bk-step ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
              <div className="bk-step-dot">{step > i + 1 ? <Check size={12} /> : i + 1}</div>
              <span className="bk-step-label">{s}</span>
              {i < steps.length - 1 && <div className="bk-step-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ STEP 1 ══════════════ */}
      {step === 1 && (
        <div className="bk-container">
          {/* Date Strip */}
          <div className="bk-date-strip">
            {DATES.map((d, i) => (
              <button
                key={i}
                className={`bk-date-btn ${selectedDate === i ? "active" : ""}`}
                onClick={() => { setSelectedDate(i); setSelectedTheater(null); setSelectedShow(null); }}
              >
                <span className="bk-date-day">{d.label}</span>
                <span className="bk-date-num">{d.date}</span>
                <span className="bk-date-mon">{d.month}</span>
              </button>
            ))}
          </div>

          {/* Theater List */}
          <div className="bk-theater-list">
            {THEATERS.map((t) => (
              <div key={t.id} className={`bk-theater-card ${selectedTheater?.id === t.id ? "selected" : ""}`}>
                <div className="bk-theater-header" onClick={() => setSelectedTheater(t)}>
                  <div>
                    <h3 className="bk-theater-name">{t.name}</h3>
                    <div className="bk-theater-meta">
                      <MapPin size={12} /> {t.area} &nbsp;•&nbsp; {t.distance}
                    </div>
                    <div className="bk-theater-tags">
                      {t.tags.map((tag) => (
                        <span key={tag} className="bk-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bk-show-times">
                  {t.shows.map((show) => (
                    <button
                      key={show}
                      className={`bk-show-btn ${selectedTheater?.id === t.id && selectedShow === show ? "active" : ""}`}
                      onClick={() => { setSelectedTheater(t); setSelectedShow(show); }}
                    >
                      <Clock size={11} /> {show}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

            <div className="bk-sticky-footer">
              <div className="bk-selection-info">
                {selectedTheater && selectedShow ? (
                  <>
                    <strong>{selectedTheater.name}</strong>
                    <span>&nbsp;•&nbsp;{DATES[selectedDate].label}, {DATES[selectedDate].date} {DATES[selectedDate].month}&nbsp;•&nbsp;{selectedShow}</span>
                  </>
                ) : (
                  <span className="bk-hint">Select a theatre and show time to continue</span>
                )}
              </div>
              <div className="bk-action-btns" style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="bk-collab-btn"
                  disabled={!selectedTheater || !selectedShow}
                  onClick={startCollabSession}
                  style={{ 
                    padding: '14px 24px', 
                    borderRadius: '30px', 
                    border: '2px solid var(--home-primary)', 
                    color: 'var(--home-primary)',
                    background: 'white',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Users size={18} /> Book with Friends
                </button>
                <button
                  className="bk-proceed-btn"
                  disabled={!selectedTheater || !selectedShow}
                  onClick={() => setShowSeatCountModal(true)}
                >
                  Select Seats <ChevronRight size={18} />
                </button>
              </div>
            </div>
        </div>
      )}

      {/* ══════════════ "How Many Seats?" MODAL ══════════════ */}
      {showSeatCountModal && (
        <div className="bk-modal-overlay" onClick={() => setShowSeatCountModal(false)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bk-modal-close" onClick={() => setShowSeatCountModal(false)}>
              <X size={20} />
            </button>

            <h2 className="bk-modal-title">How many seats?</h2>

            {/* Vehicle Illustration */}
            <div className="bk-scooter" style={{ marginBottom: "30px", marginTop: "10px" }}>
              {seatCount >= 4 ? (
                <img src="https://img.icons8.com/fluency/240/car.png" alt="Car" style={{ height: "120px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }} />
              ) : seatCount === 3 ? (
                <img src="https://img.icons8.com/fluency/240/auto-rickshaw.png" alt="Auto Rickshaw" style={{ height: "120px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }} />
              ) : (
                <img src="https://img.icons8.com/fluency/240/scooter.png" alt="Scooter" style={{ height: "120px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }} />
              )}
            </div>

            {/* Seat Count Selector */}
            <div className="bk-seat-count-row">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`bk-count-btn ${seatCount === n ? "active" : ""}`}
                  onClick={() => setSeatCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <hr className="bk-modal-divider" />

            {/* Category Prices */}
            <div className="bk-modal-categories">
              {Object.entries(SEAT_LAYOUT).map(([cat, info]) => (
                <div key={cat} className="bk-modal-cat">
                  <p className="bk-modal-cat-name">{cat}</p>
                  <p className="bk-modal-cat-price">₹{info.price}</p>
                  <p className="bk-modal-cat-status" style={{ color: catStatusColor[cat] }}>
                    {catStatus[cat]}
                  </p>
                </div>
              ))}
            </div>

            <div className="bk-modal-bestseller">
              <div className="bk-bestseller-badge" />
              <span>Book the <strong>Bestseller Seats</strong> in this cinema at no extra cost!</span>
            </div>

            <button
              className="bk-modal-select-btn"
              onClick={() => {
                setSelectedSeats([]);
                setShowSeatCountModal(false);
                setStep(2);
              }}
            >
              Select Seats
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ STEP 2: SEATS ══════════════ */}
      {step === 2 && (
        <SeatSelection 
          title={movie.title}
          type="movie"
          sessionId={sessionId}
          requiredSeats={seatCount}
          onClose={() => setStep(1)}
          onConfirm={(seats, price) => {
            setSelectedSeats(seats);
            setStep(3);
          }}
        />
      )}

      {/* ══════════════ STEP 3 ══════════════ */}
      {step === 3 && (
        <div className="bk-container bk-summary-container">
          <div className="bk-summary-grid">
            {/* Left – Booking summary */}
            <div className="bk-summary-card">
              <div className="bk-summary-movie-row">
                <img src={movie.poster} alt={movie.title} className="bk-summary-poster" />
                <div>
                  <h2 className="bk-summary-title">{movie.title}</h2>
                  <p className="bk-summary-meta">{movie.genre} • {movie.duration}</p>
                  <p className="bk-summary-theater">{selectedTheater?.name}</p>
                  <p className="bk-summary-show">
                    <Calendar size={13} />&nbsp;
                    {DATES[selectedDate].label}, {DATES[selectedDate].date} {DATES[selectedDate].month}&nbsp;|&nbsp;
                    <Clock size={13} />&nbsp;{selectedShow}
                  </p>
                </div>
              </div>

              <div className="bk-divider" />

              <div className="bk-seats-summary">
                <h4><Ticket size={15} /> Your Seats</h4>
                <div className="bk-seats-tags">
                  {selectedSeats.map((s) => (
                    <span key={s} className="bk-seat-tag">{s}</span>
                  ))}
                </div>
              </div>

              <div className="bk-divider" />

              <div className="bk-price-breakdown">
                <div className="bk-price-row">
                  <span>{selectedSeats.length} × Ticket{selectedSeats.length > 1 ? "s" : ""}</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="bk-price-row">
                  <span>Convenience Fee</span>
                  <span>₹{convenienceFee}</span>
                </div>
                <div className="bk-price-row total">
                  <span>Total Amount</span>
                  <span>₹{totalAmount + convenienceFee}</span>
                </div>
              </div>
            </div>

            {/* Right – Payment */}
            <div className="bk-payment-card">
              <h3 className="bk-payment-title">Payment Options</h3>

              {[
                { id: "upi",   label: "UPI",                sub: "Google Pay, PhonePe, Paytm" },
                { id: "card",  label: "Credit / Debit Card", sub: "All major cards accepted" },
                { id: "nb",    label: "Net Banking",         sub: "All major banks" },
                { id: "wallet",label: "Wallets",             sub: "Paytm, Amazon Pay & more" },
              ].map(({ id, label, sub }) => (
                <label key={id} className="bk-payment-option">
                  <input type="radio" name="pay" value={id} defaultChecked={id === "upi"} />
                  <div className="bk-payment-info">
                    <span className="bk-payment-label">{label}</span>
                    <span className="bk-payment-sub">{sub}</span>
                  </div>
                </label>
              ))}

              <div className="bk-offer-box" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%" }}>
                  <span>🏷️</span>
                  <div style={{ flex: 1 }}>
                    <p className="bk-offer-title">Unlock Offers</p>
                    <p className="bk-offer-sub">Bank & Promo offers</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", width: "100%", marginTop: "5px" }}>
                  <input 
                    type="text" 
                    placeholder="Enter Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #eee", fontSize: "13px" }}
                  />
                  <button 
                    onClick={applyCoupon}
                    style={{ background: "#111", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#2ecc71", fontWeight: "700" }}>
                    ✓ Coupon {appliedCoupon.code} applied!
                  </p>
                )}
              </div>

                <div className="bk-pay-total">
                  <div>
                    <p className="bk-pay-label">Grand Total</p>
                    {discountAmount > 0 && (
                      <p style={{ fontSize: "12px", color: "#2ecc71", margin: "0 0 2px" }}>Discount: -₹{discountAmount.toFixed(2)}</p>
                    )}
                    <p className="bk-pay-amount">₹{(totalAmount + convenienceFee - discountAmount).toFixed(2)}</p>
                  </div>
                <button
                  className={`bk-pay-btn ${paymentSuccess ? "success" : ""}`}
                  onClick={handlePayNow}
                  disabled={paymentSuccess}
                >
                  {paymentSuccess ? <><CheckCircle size={20} /> Paid!</> : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ SNACK PROMPT MODAL ══════════════ */}
      {showSnackPrompt && (
        <div className="bk-modal-overlay" onClick={() => setShowSnackPrompt(false)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="bk-modal-title" style={{ marginTop: "10px" }}>Hungry? 🍿</h2>
            <p style={{ textAlign: "center", color: "#666", marginBottom: "30px", fontSize: "15px" }}>
              Book snacks beforehand and get them delivered to your seat during the interval!
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "2px solid #ddd", background: "transparent", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}
                onClick={() => {
                  setShowSnackPrompt(false);
                  finalizeBooking();
                }}
              >
                No, skip
              </button>
              <button
                style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", background: "var(--bk-primary)", color: "white", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}
                onClick={() => {
                  setShowSnackPrompt(false);
                  setStep(4);
                }}
              >
                Yes, add snacks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ STEP 4: FOOD MENU ══════════════ */}
      {step === 4 && (
        <div className="bk-container">
          <div className="bk-food-header" style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "24px", margin: "0 0 4px" }}>Grab a bite! 🍿</h2>
            <p style={{ color: "#666", margin: "0" }}>Pre-book your favorite snacks</p>
          </div>

          {/* Delivery Timing Control */}
          <div className="delivery-timing-control" style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '16px', 
            marginBottom: '24px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#111' }}>Delivery Timing</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setDeliveryPreference('start')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: deliveryPreference === 'start' ? '2px solid #f84464' : '2.5px solid #eee',
                  background: deliveryPreference === 'start' ? '#fff5f6' : 'white',
                  color: deliveryPreference === 'start' ? '#f84464' : '#666',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Before Show Starts
              </button>
              <button 
                onClick={() => setDeliveryPreference('interval')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: deliveryPreference === 'interval' ? '2px solid #f84464' : '2.5px solid #eee',
                  background: deliveryPreference === 'interval' ? '#fff5f6' : 'white',
                  color: deliveryPreference === 'interval' ? '#f84464' : '#666',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                During Interval
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", paddingBottom: "100px" }}>
            {FOOD_MENU.map(item => {
              const qty = selectedFood[item.id] || 0;
              return (
                <div key={item.id} style={{ background: "white", padding: "16px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                  <img src={item.image} alt={item.name} style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "12px" }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700" }}>{item.name}</h4>
                    <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#888" }}>{item.desc}</p>
                    <div style={{ fontWeight: "800", color: "#111" }}>₹{item.price}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8f9fa", padding: "6px", borderRadius: "8px" }}>
                    <button style={{ width: "28px", height: "28px", border: "none", background: "white", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }} onClick={() => updateFoodQty(item.id, -1)} disabled={qty === 0}>-</button>
                    <span style={{ fontWeight: "700", width: "16px", textAlign: "center" }}>{qty}</span>
                    <button style={{ width: "28px", height: "28px", border: "none", background: "white", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", color: "var(--bk-primary)" }} onClick={() => updateFoodQty(item.id, 1)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bk-sticky-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "4px" }}>Total with snacks</span>
              <strong style={{ fontSize: "20px" }}>₹{totalAmount + convenienceFee + foodTotal}</strong>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                style={{ padding: "14px 24px", borderRadius: "30px", border: "2px solid #e0e0e0", background: "white", fontWeight: "700", cursor: "pointer" }}
                onClick={() => setStep(3)}
              >
                Back
              </button>
              <button
                className="bk-proceed-btn"
                onClick={finalizeBooking}
              >
                Confirm Payment <CheckCircle size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TICKET MODAL ══════════════ */}
      {showTicket && bookedTicket && (
        <div className="bk-ticket-overlay" onClick={() => setShowTicket(false)}>
          <div className="bk-ticket-modal" onClick={(e) => e.stopPropagation()}>
            {/* Success header */}
            <div className="bk-ticket-success-header">
              <div className="bk-ticket-check"><CheckCircle size={36} /></div>
              <h2>Booking Confirmed!</h2>
              <p>Your tickets are ready. Have a great time!</p>
              
              <div className="bk-social-booking">
                <p>How's the excitement?</p>
                <div className="bk-emoji-reactions">
                  {['🔥', '😍', '🍿', '🎟️', '😎'].map(emoji => (
                    <button key={emoji} className="bk-emoji-btn" onClick={() => saveReaction(emoji)}>{emoji}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ticket card */}
            <div className="bk-ticket-card">
              {/* Left - movie poster strip */}
              <div className="bk-ticket-poster-strip">
                <img src={bookedTicket.moviePoster} alt={bookedTicket.movieTitle} className="bk-ticket-poster" />
                <div className="bk-ticket-genre-tag">{bookedTicket.movieGenre.split("/")[0]}</div>
              </div>

              {/* Tear line */}
              <div className="bk-ticket-tear">
                <div className="bk-ticket-notch top" />
                <div className="bk-ticket-dash-line" />
                <div className="bk-ticket-notch bottom" />
              </div>

              {/* Right - details */}
              <div className="bk-ticket-details">
                <h3 className="bk-ticket-movie">{bookedTicket.movieTitle}</h3>
                <p className="bk-ticket-duration">{bookedTicket.movieDuration}</p>

                <div className="bk-ticket-info-grid">
                  <div className="bk-ticket-info-item">
                    <span className="bk-ticket-info-label">🏟️ Theatre</span>
                    <span className="bk-ticket-info-value">{bookedTicket.theater}</span>
                    <span className="bk-ticket-info-sub">{bookedTicket.theaterArea}</span>
                  </div>
                  <div className="bk-ticket-info-item">
                    <span className="bk-ticket-info-label">📅 Date & Time</span>
                    <span className="bk-ticket-info-value">{bookedTicket.date}</span>
                    <span className="bk-ticket-info-sub">{bookedTicket.show}</span>
                  </div>
                  <div className="bk-ticket-info-item">
                    <span className="bk-ticket-info-label">🪑 Seats</span>
                    <span className="bk-ticket-info-value">{bookedTicket.seats.join(", ")}</span>
                    <span className="bk-ticket-info-sub">{bookedTicket.seatCount} Seat{bookedTicket.seatCount > 1 ? "s" : ""}</span>
                  </div>
                  <div className="bk-ticket-info-item">
                    <span className="bk-ticket-info-label">💳 Amount Paid</span>
                    <span className="bk-ticket-info-value bk-ticket-amount">₹{bookedTicket.totalAmount}</span>
                    <span className="bk-ticket-info-sub">Incl. convenience fee</span>
                  </div>
                </div>

                {bookedTicket.orderedFood?.length > 0 && (
                  <div style={{ marginTop: "16px", padding: "12px", background: "#f8f9fa", borderRadius: "10px", fontSize: "12px" }}>
                    <div style={{ fontWeight: "800", marginBottom: "6px", color: "#444" }}>🍿 Food Orders:</div>
                    <div style={{ color: "#666", lineHeight: "1.4" }}>{bookedTicket.orderedFood.join(", ")}</div>
                    <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "700", color: "#222" }}>Food Total: ₹{bookedTicket.foodAmount}</span>
                      <span style={{ fontSize: "10px", background: "#eee", padding: "2px 8px", borderRadius: "4px", fontWeight: "800", color: "#555" }}>
                        DELIVERY: {bookedTicket.deliveryPreference === 'start' ? 'BEFORE SHOW' : 'AT INTERVAL'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bk-ticket-barcode-row">
                  <div className="bk-ticket-qrcode">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${bookedTicket.bookingId}`} 
                      alt="QR Code" 
                      style={{ width: '80px', height: '80px' }}
                    />
                  </div>
                  <span className="bk-ticket-booking-id">{bookedTicket.bookingId}</span>
                </div>

                <div className="bk-post-booking-review">
                   <h4>Quick Review</h4>
                   <div className="review-input-wrapper">
                     <input type="text" placeholder="Loved the collaborative experience?" />
                     <button><Send size={14} /></button>
                   </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bk-ticket-actions">
              <button className="bk-ticket-close-btn" onClick={() => { setShowTicket(false); navigate("/home"); }}>
                <Home size={16} /> Go to Home
              </button>
              <button className="bk-ticket-view-btn" onClick={() => { setShowTicket(false); navigate("/bookings"); }}>
                <Ticket size={16} /> My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reaction Toast */}
      {reactionToast.show && (
        <div className="bk-reaction-toast">
          <div className="bk-toast-emoji">{reactionToast.emoji}</div>
          <div className="bk-toast-text">
            <h4>Thank You!</h4>
            <p>Your reaction has been shared.</p>
          </div>
        </div>
      )}
    </div>
  );
}
