import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar, Star, Check, Ticket, X, CheckCircle, Home, Info, Users, Send } from "lucide-react";
import { auth, db } from "../firebase";
import musicData from "../data/music.json";
import SeatSelection from "../components/SeatSelection";
import { useLocation } from "react-router-dom";
import "../styles/booking.css";

const SEAT_LAYOUT = {
  "VIP":      { price: 5000, rows: ["A","B"],             cols: 10, gap: [5] },
  "PREMIUM":  { price: 3000, rows: ["C","D","E","F"],      cols: 15, gap: [5, 10] },
  "GALLERY":  { price: 1500, rows: ["G","H","I","J","K"],  cols: 20, gap: [10] },
  "GENERAL":  { price: 800,  rows: ["L","M","N","O","P"],  cols: 20, gap: [5, 15] },
};

const UNAVAILABLE = new Set(["A3","A7","B2","B6","C4","C9","D1","D11","E5","F3","F8","G2","G10","H4","H12","I6","J1","J9","K7","L3","L14","M5","M11","N2","N8","O4","O13","P6","P10"]);

export default function MusicBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  
  // 1=Venue Info, 2=Seats, 3=Summary
  const [step, setStep] = useState(1); 
  const [showSeatCountModal, setShowSeatCountModal] = useState(false);
  const [seatCount, setSeatCount] = useState(2);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isCollab, setIsCollab] = useState(false);
  const location = useLocation();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookedTicket, setBookedTicket] = useState(null);
  const [reactionToast, setReactionToast] = useState({ show: false, emoji: "" });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    const found = musicData.find(s => s.id === id);
    if (found) setEvent(found);
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session = params.get("session");
    if (session) {
      setSessionId(session);
      setIsCollab(true);
      setStep(2);
    }
  }, [location]);

  const startCollabSession = () => {
    const sid = "session_music_" + Math.random().toString(36).substr(2, 9);
    setSessionId(sid);
    setIsCollab(true);
    setStep(2);
  };

  if (!event) return <div className="bk-loading">Loading...</div>;

  const getSeatPrice = (sid) => {
    const row = sid[0];
    for (const [cat, info] of Object.entries(SEAT_LAYOUT)) {
      if (info.rows.includes(row)) return info.price;
    }
    return 0;
  };

  const toggleSeat = (sid) => {
    if (UNAVAILABLE.has(sid)) return;
    setSelectedSeats((prev) => {
      if (prev.includes(sid)) return prev.filter((s) => s !== sid);
      if (prev.length >= seatCount) return prev; 
      return [...prev, sid];
    });
  };

  const totalAmount = selectedSeats.reduce((sum, sid) => sum + getSeatPrice(sid), 0);
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 50 : 0;

  const finalizeBooking = () => {
    const bookingId = "MU" + Date.now().toString().slice(-8);
    const user = auth.currentUser;
    const storageKey = user ? `showbuzz_bookings_${user.uid}` : "showbuzz_bookings_guest";

    const ticket = {
      id: bookingId,
      bookingId,
      movieTitle: event.title,
      moviePoster: event.poster,
      movieGenre: event.category,
      movieDuration: event.time,
      theater: event.venue,
      theaterArea: event.venue.split(",")[1],
      date: event.date,
      show: event.time,
      seats: selectedSeats,
      seatCount: selectedSeats.length,
      totalAmount: totalAmount + convenienceFee,
      baseAmount: totalAmount,
      convenienceFee,
      isMusic: true,
      eventId: event.id,
      createdAt: Date.now(),
    };

    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    localStorage.setItem(storageKey, JSON.stringify([ticket, ...existing]));
    setBookedTicket(ticket);
    setPaymentSuccess(true);
  };

  const userId = auth.currentUser?.uid || "guest";
  const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Guest";

  const saveReaction = (emoji) => {
    const allReactions = JSON.parse(localStorage.getItem("showbuzz_reactions") || "{}");
    const eventReactions = allReactions[event.title] || [];
    allReactions[event.title] = [...eventReactions, { emoji, userName, userId, createdAt: Date.now() }];
    localStorage.setItem("showbuzz_reactions", JSON.stringify(allReactions));
    setReactionToast({ show: true, emoji });
    setTimeout(() => setReactionToast({ show: false, emoji: "" }), 3000);
  };

  const applyCoupon = () => {
    const saved = JSON.parse(localStorage.getItem(`showbuzz_bookings_${userId}`) || "[]");
    const musicSpend = saved.filter(b => b.isMusic).reduce((sum, b) => sum + b.totalAmount, 0);
    const points = Math.floor(saved.reduce((sum, b) => sum + b.totalAmount, 0) / 10);
    
    let disc = 0;
    let code = couponCode.toUpperCase();
    
    if (code === "MUSIC15" && musicSpend > 1500) {
      disc = (totalAmount + convenienceFee) * 0.15;
      setAppliedCoupon({ code, discount: "15%" });
    } else if (code === "BUZZ10" && points > 200) {
      disc = (totalAmount + convenienceFee) * 0.1;
      setAppliedCoupon({ code, discount: "10%" });
    } else {
      alert("Invalid coupon or requirements not met.");
      return;
    }
    setDiscountAmount(disc);
  };

  return (
    <div className="bk-page">
      {/* ══════════════ TOP BAR ══════════════ */}
      <div className="bk-topbar">
        <button className="bk-back" onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}>
          <ChevronLeft size={20} /> Back
        </button>
        
        <div className="bk-topbar-center">
          <h1 className="bk-movie-title">{event.title}</h1>
          <p className="bk-movie-meta">
            {event.category} • {event.venue.split(",")[0]}
          </p>
        </div>

        <div className="bk-steps">
           <div className={`bk-step ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
             <div className="bk-step-dot">{step > 1 ? <Check size={14} /> : "1"}</div>
             <span className="bk-step-label">Venue Info</span>
           </div>
           <div className="bk-step-line" />
           <div className={`bk-step ${step >= 2 ? "active" : ""} ${step > 2 ? "done" : ""}`}>
             <div className="bk-step-dot">{step > 2 ? <Check size={14} /> : "2"}</div>
             <span className="bk-step-label">Seats</span>
           </div>
           <div className="bk-step-line" />
           <div className={`bk-step ${step >= 3 ? "active" : ""}`}>
             <div className="bk-step-dot">3</div>
             <span className="bk-step-label">Payment</span>
           </div>
        </div>
      </div>

      <div className="bk-container">
        {/* ══════════════ STEP 1: INFO ══════════════ */}
        {step === 1 && (
          <div className="bk-theater-list">
            <div className="bk-theater-card selected">
               <div className="bk-theater-header">
                  <h2 className="bk-theater-name">{event.venue}</h2>
                  <div className="bk-theater-meta">
                    <MapPin size={14} /> {event.venue.split(",")[1] || "Concert Arena"} • {event.date}
                  </div>
                  <div className="bk-theater-tags">
                    <span className="bk-tag">Gate Entry</span>
                    <span className="bk-tag">M-Ticket</span>
                  </div>
               </div>
               <div className="bk-show-times">
                  <button className="bk-show-btn active">
                    <Clock size={12} /> {event.time}
                  </button>
               </div>
            </div>

            <div className="bk-sticky-footer">
               <div className="bk-selection-info">
                 <strong>{event.title}</strong>
                 <span className="bk-hint">&nbsp;•&nbsp;{event.date}&nbsp;•&nbsp;{event.time}</span>
               </div>
                <div className="bk-action-btns" style={{ display: 'flex', gap: '12px' }}>
                  <button className="bk-collab-btn" onClick={startCollabSession} style={{ padding: '14px 24px', borderRadius: '30px', border: '2px solid var(--home-primary)', color: 'var(--home-primary)', background: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} /> Book with Friends
                  </button>
                  <button className="bk-proceed-btn" onClick={() => setShowSeatCountModal(true)}>
                    Select Seats <ChevronRight size={18} />
                  </button>
                </div>
              </div>
          </div>
        )}

        {/* ══════════════ STEP 2: SEATS ══════════════ */}
        {step === 2 && (
          <SeatSelection 
            title={event.title}
            type="music"
            sessionId={sessionId}
            requiredSeats={seatCount}
            onClose={() => setStep(1)}
            onConfirm={(seats, price) => {
              setSelectedSeats(seats);
              setStep(3);
            }}
          />
        )}

        {/* ══════════════ STEP 3: SUMMARY ══════════════ */}
        {step === 3 && (
          <div className="bk-summary-container">
             <div className="bk-summary-grid">
               <div className="bk-summary-card">
                  <div className="bk-summary-movie-row">
                    <img src={event.poster} alt={event.title} className="bk-summary-poster" />
                    <div>
                      <p className="bk-summary-meta">{event.category}</p>
                      <h2 className="bk-summary-title">{event.title}</h2>
                      <p className="bk-summary-theater">{event.venue}</p>
                      <p className="bk-summary-show">
                        <Calendar size={14} /> {event.date} • <Clock size={14} /> {event.time}
                      </p>
                    </div>
                  </div>
                  
                  <hr className="bk-divider" />
                  
                  <div className="bk-seats-summary">
                    <h4><Ticket size={16} /> Selected Seats</h4>
                    <div className="bk-seats-tags">
                      {selectedSeats.map(s => <span key={s} className="bk-seat-tag">{s}</span>)}
                    </div>
                  </div>
               </div>

               <div className="bk-payment-card">
                  <h3 className="bk-payment-title">Booking Summary</h3>
                  <div className="bk-price-breakdown">
                    <div className="bk-price-row">
                      <span>Ticket Price ({selectedSeats.length}x)</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    <div className="bk-price-row">
                      <span>Convenience Fees</span>
                      <span>₹{convenienceFee}</span>
                    </div>
                    <div className="bk-price-row total">
                      <span>Total Amount</span>
                      <span>₹{totalAmount + convenienceFee}</span>
                    </div>
                  </div>

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
                    <button className={`bk-pay-btn ${paymentSuccess ? "success" : ""}`} onClick={finalizeBooking} disabled={paymentSuccess}>
                      {paymentSuccess ? <><CheckCircle size={20} /> Paid!</> : "Pay Now"}
                    </button>
                  </div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* ══════════════ SEAT COUNT MODAL ══════════════ */}
      {showSeatCountModal && (
        <div className="bk-modal-overlay" onClick={() => setShowSeatCountModal(false)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bk-modal-close" onClick={() => setShowSeatCountModal(false)}>
              <X size={20} />
            </button>
            <h2 className="bk-modal-title">How many seats?</h2>

            <div className="bk-scooter" style={{marginBottom: "30px", marginTop: "10px"}}>
              {seatCount >= 4 ? (
                <img src="https://img.icons8.com/fluency/240/car.png" alt="Car" style={{ height: "120px" }} />
              ) : seatCount === 3 ? (
                <img src="https://img.icons8.com/fluency/240/auto-rickshaw.png" alt="Auto" style={{ height: "120px" }} />
              ) : (
                <img src="https://img.icons8.com/fluency/240/scooter.png" alt="Scooter" style={{ height: "120px" }} />
              )}
            </div>

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
            <div className="bk-modal-categories">
              {Object.entries(SEAT_LAYOUT).map(([cat, info]) => (
                <div key={cat} className="bk-modal-cat">
                  <p className="bk-modal-cat-name">{cat}</p>
                  <p className="bk-modal-cat-price">₹{info.price}</p>
                  <p className="bk-modal-cat-status" style={{color: "#2ecc71"}}>AVAILABLE</p>
                </div>
              ))}
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

      {/* Success Modal */}
      {paymentSuccess && (
        <div className="bk-ticket-overlay">
          <div className="bk-ticket-modal">
            <div className="bk-ticket-success-header">
               <div className="bk-ticket-check"><CheckCircle size={40} /></div>
               <h2>Booking Confirmed!</h2>
               <p>Your tickets for {event.title} are ready</p>
            </div>
            
            <div className="bk-ticket-card">
               <div className="bk-ticket-poster-strip">
                 <img src={event.poster} alt={event.title} className="bk-ticket-poster" />
                 <div className="bk-ticket-genre-tag">{event.category}</div>
               </div>
               <div className="bk-ticket-tear">
                 <div className="bk-ticket-notch top" />
                 <div className="bk-ticket-dash-line" />
                 <div className="bk-ticket-notch bottom" />
               </div>
               <div style={{flex: 1, padding: "20px"}}>
                  <h3 style={{fontSize: "18px", margin: "0 0 10px"}}>{event.title}</h3>
                  <div style={{fontSize: "12px", color: "#666", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px"}}>
                    <div>
                      <p style={{margin: "0 0 4px"}}><strong>DATE</strong></p>
                      <p>{event.date}</p>
                    </div>
                    <div>
                      <p style={{margin: "0 0 4px"}}><strong>TIME</strong></p>
                      <p>{event.time}</p>
                    </div>
                    <div>
                      <p style={{margin: "0 0 4px"}}><strong>SEATS</strong></p>
                      <p>{selectedSeats.join(", ")}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bk-social-booking" style={{ marginTop: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>How's the excitement?</p>
              <div className="bk-emoji-reactions" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                {['🔥', '😍', '🍿', '🎟️', '😎'].map(emoji => (
                  <button key={emoji} className="bk-emoji-btn" onClick={() => saveReaction(emoji)} style={{ fontSize: "24px", background: "none", border: "none", cursor: "pointer", padding: "8px", transition: "transform 0.2s" }} onMouseOver={(e) => e.target.style.transform = "scale(1.3)"} onMouseOut={(e) => e.target.style.transform = "scale(1)"}>{emoji}</button>
                ))}
              </div>
            </div>

            <div className="bk-post-booking-review" style={{ marginTop: "20px" }}>
               <h4 style={{ fontSize: "14px", margin: "0 0 10px" }}>Quick Review</h4>
               <div className="review-input-wrapper" style={{ display: "flex", gap: "8px" }}>
                 <input type="text" placeholder="Loved the experience?" style={{ flex: 1, padding: "10px 16px", borderRadius: "10px", border: "1px solid #ddd" }} />
                 <button style={{ padding: "10px", background: "#111", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}><Send size={14} /></button>
               </div>
            </div>

            <div className="bk-success-actions" style={{display: "flex", gap: "12px", marginTop: "20px"}}>
              <button className="bk-success-home-btn" onClick={() => navigate("/home")} style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", borderRadius: "12px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: "700"}}><Home size={18} /> Home</button>
              <button className="bk-success-tickets-btn" onClick={() => navigate("/bookings")} style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", borderRadius: "12px", border: "none", background: "var(--bk-primary)", color: "white", cursor: "pointer", fontWeight: "700"}}><Ticket size={18} /> View Bookings</button>
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
