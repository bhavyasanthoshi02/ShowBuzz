import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, Calendar, Clock, MapPin, ChevronRight, Trash2, Film, X, BarChart3, Gift, Zap, Music } from "lucide-react";
import { auth, onAuthStateChanged } from "../firebase";
import Navbar from "../components/Navbar";
import "../styles/bookings.css";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [modal, setModal] = useState({ show: false, type: "", title: "", message: "", data: null, onConfirm: null });
  const [showInsights, setShowInsights] = useState(false);

  const closeModal = () => setModal({ ...modal, show: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const storageKey = `showbuzz_bookings_${user.uid}`;
        const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setBookings(saved);
      } else {
        const saved = JSON.parse(localStorage.getItem("showbuzz_bookings_guest") || "[]");
        setBookings(saved);
      }
    });
    return () => unsubscribe();
  }, []);

  const deleteBooking = (id) => {
    setModal({
      show: true,
      type: "confirm",
      title: "Remove from History?",
      message: "Are you sure you want to remove this booking from your history? This action cannot be undone.",
      onConfirm: () => {
        const user = auth.currentUser;
        const storageKey = user ? `showbuzz_bookings_${user.uid}` : "showbuzz_bookings_guest";
        const updated = bookings.filter((b) => b.id !== id);
        setBookings(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        closeModal();
      }
    });
  };

  const cancelBooking = (ticket) => {
    const isTodayBooking = isToday(ticket.date);
    const deductionRate = isTodayBooking ? 0.4 : 0.2;
    const deductionAmount = ticket.totalAmount * deductionRate;
    const refundAmount = ticket.totalAmount - deductionAmount;
    
    setModal({
      show: true,
      type: "cancel",
      title: "Cancel Booking",
      data: {
        total: ticket.totalAmount,
        deduction: deductionAmount,
        refund: refundAmount,
        rate: deductionRate * 100,
        isToday: isTodayBooking
      },
      onConfirm: () => {
        const user = auth.currentUser;
        const storageKey = user ? `showbuzz_bookings_${user.uid}` : "showbuzz_bookings_guest";
        const updated = bookings.filter((b) => b.id !== ticket.id);
        setBookings(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        
        setModal({
          show: true,
          type: "success",
          title: "Booking Canceled",
          message: `Your booking has been successfully canceled. ₹${refundAmount.toFixed(2)} will be refunded to your account within 3-5 business days.`,
          onConfirm: closeModal
        });
      }
    });
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = dateStr.split(", ");
    if (parts.length < 2) return false;
    const dateParts = parts[1].split(" ");
    const day = parseInt(dateParts[0]);
    const month = months.indexOf(dateParts[1]);
    const now = new Date();
    return day === now.getDate() && month === now.getMonth();
  };

  const isPastBooking = (dateStr) => {
    if (!dateStr) return false;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = dateStr.split(", ");
    if (parts.length < 2) return false;
    const dateParts = parts[1].split(" "); // "27", "Apr"
    const day = parseInt(dateParts[0]);
    const month = months.indexOf(dateParts[1]);
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const bookingDate = new Date(currentYear, month, day);
    
    // Simple heuristic for year wrap-around
    if (month === 0 && now.getMonth() === 11) bookingDate.setFullYear(currentYear + 1);
    if (month === 11 && now.getMonth() === 0) bookingDate.setFullYear(currentYear - 1);
    
    bookingDate.setHours(23, 59, 59, 999);
    return bookingDate < now;
  };

  const upcomingBookings = bookings.filter(b => !isPastBooking(b.date));
  const historyBookings = bookings.filter(b => isPastBooking(b.date));

  const stats = {
    totalSpent: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
    movieSpend: bookings.filter(b => !b.isSport && !b.isMusic).reduce((sum, b) => sum + b.totalAmount, 0),
    sportSpend: bookings.filter(b => b.isSport).reduce((sum, b) => sum + b.totalAmount, 0),
    musicSpend: bookings.filter(b => b.isMusic).reduce((sum, b) => sum + b.totalAmount, 0),
    points: Math.floor(bookings.reduce((sum, b) => sum + b.totalAmount, 0) / 10),
    historyCount: historyBookings.length
  };

  const getCoupons = () => {
    const coupons = [];
    if (stats.movieSpend > 1000) coupons.push({ code: "MOVIE20", discount: "20%", type: "Movies", desc: "Spend >₹1000 on Movies" });
    if (stats.sportSpend > 500) coupons.push({ code: "SPORT50", discount: "₹50 Off", type: "Sports", desc: "Spend >₹500 on Sports" });
    if (stats.musicSpend > 1500) coupons.push({ code: "MUSIC15", discount: "15%", type: "Music", desc: "Spend >₹1500 on Music" });
    if (stats.points > 200) coupons.push({ code: "BUZZ10", discount: "10%", type: "All", desc: "Loyalty Reward (200+ Pts)" });
    return coupons;
  };

  const availableCoupons = getCoupons();

  return (
    <div className="my-bk-page">
      <Navbar />
      <div className="my-bk-container">
        <div className="my-bk-header">
          <div className="my-bk-header-left">
            <div className="my-bk-header-icon"><Ticket size={28} /></div>
            <div>
              <h1 className="my-bk-title">My Bookings</h1>
              <p className="my-bk-subtitle">{bookings.length} ticket{bookings.length !== 1 ? "s" : ""} booked</p>
            </div>
          </div>
          
          <div className="my-bk-stats">
            <div className="my-bk-stat-card">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">₹{stats.totalSpent}</span>
            </div>
            <div className="my-bk-stat-card">
              <span className="stat-label">Buzz Points</span>
              <span className="stat-value points" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={16} fill="#f39c12" stroke="#f39c12" /> {stats.points}
              </span>
            </div>
            <div className="my-bk-stat-card">
              <span className="stat-label">Events Attended</span>
              <span className="stat-value">{stats.historyCount}</span>
            </div>
            <div 
              className={`my-bk-stat-card discount-toggle ${showInsights ? "active" : ""}`}
              onClick={() => setShowInsights(!showInsights)}
            >
              <span className="stat-label">Discounts</span>
              <span className="stat-value text-success">{availableCoupons.length} Active</span>
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="my-bk-empty">
            <div className="my-bk-empty-icon"><Film size={56} /></div>
            <h2>No bookings yet</h2>
            <p>Your booked tickets will appear here once you complete a booking.</p>
            <button className="my-bk-browse-btn" onClick={() => navigate("/home")}>
              Explore Movies, Sports & Events
            </button>
          </div>
        ) : (
          <div className="my-bk-list">
            {showInsights ? (
              <div className="my-bk-insights-panel">
                <div className="insights-header">
                  <h2 className="my-bk-section-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <BarChart3 size={22} color="#E50914" /> Spending Insights
                  </h2>
                  <button className="back-to-bookings" onClick={() => setShowInsights(false)}>View All Bookings</button>
                </div>
                
                <div className="insights-container">
                  <div className="donut-chart-wrap">
                    <div 
                      className="donut-chart" 
                      style={{ 
                        background: stats.totalSpent > 0 ? `conic-gradient(
                          #E50914 0% ${(stats.movieSpend/stats.totalSpent*100)}%, 
                          #3498db ${(stats.movieSpend/stats.totalSpent*100)}% ${((stats.movieSpend+stats.sportSpend)/stats.totalSpent*100)}%, 
                          #9b59b6 ${((stats.movieSpend+stats.sportSpend)/stats.totalSpent*100)}% 100%
                        )` : "#eee"
                      }}
                    >
                      <div className="donut-hole">
                        <span className="donut-total-label">Total Spent</span>
                        <span className="donut-total-val">₹{stats.totalSpent}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="spending-legend">
                    {[
                      { label: "Movies", val: stats.movieSpend, color: "#E50914", icon: <Film size={18} /> },
                      { label: "Sports", val: stats.sportSpend, color: "#3498db", icon: <Ticket size={18} /> },
                      { label: "Music",  val: stats.musicSpend, color: "#9b59b6", icon: <Music size={18} /> }
                    ].map(item => (
                      <div key={item.label} className="legend-item">
                        <div className="legend-marker" style={{ background: item.color }}>{item.icon}</div>
                        <div className="legend-info">
                          <span className="legend-label">{item.label}</span>
                          <span className="legend-perc">{stats.totalSpent > 0 ? Math.round(item.val / stats.totalSpent * 100) : 0}%</span>
                        </div>
                        <span className="legend-amount">₹{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupons moved here */}
                {availableCoupons.length > 0 && (
                  <div className="my-bk-coupons-wrap" style={{ marginTop: "40px" }}>
                    <h2 className="my-bk-section-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Gift size={22} color="#E50914" /> My Exclusive Coupons
                    </h2>
                    <div className="my-bk-coupons-grid">
                      {availableCoupons.map((c) => (
                        <div key={c.code} className="my-bk-coupon-card">
                          <div className="coupon-left" style={{ background: c.type === "Movies" ? "#E50914" : c.type === "Sports" ? "#3498db" : "#9b59b6" }}>
                            <span className="coupon-discount">{c.discount}</span>
                            <span className="coupon-type">{c.type}</span>
                          </div>
                          <div className="coupon-right">
                            <div className="coupon-code-wrap">
                              <code className="coupon-code">{c.code}</code>
                              <button className="coupon-copy" onClick={() => {
                                navigator.clipboard.writeText(c.code);
                                setModal({ show: true, type: "success", title: "Code Copied!", message: `Coupon ${c.code} copied to clipboard!` });
                              }}>Copy</button>
                            </div>
                            <p className="coupon-desc">{c.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {upcomingBookings.length > 0 && (
                  <div className="my-bk-section">
                    <h2 className="my-bk-section-title" style={{ fontSize: "18px", fontWeight: "800", color: "#111", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                       <Clock size={18} className="text-primary" style={{ color: "#E50914" }} /> Current Bookings
                    </h2>
                    <div className="my-bk-list" style={{ marginBottom: "40px" }}>
                      {upcomingBookings.map((ticket) => (
                        <BookingCard key={ticket.id} ticket={ticket} onCancel={() => cancelBooking(ticket)} navigate={navigate} />
                      ))}
                    </div>
                  </div>
                )}

                {historyBookings.length > 0 && (
                  <div className="my-bk-section">
                    <h2 className="my-bk-section-title" style={{ fontSize: "18px", fontWeight: "800", color: "#666", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                       <Calendar size={18} /> Booking History
                    </h2>
                    <div className="my-bk-list" style={{ opacity: 0.85 }}>
                      {historyBookings.map((ticket) => (
                        <BookingCard key={ticket.id} ticket={ticket} onDelete={() => deleteBooking(ticket.id)} navigate={navigate} isHistory />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Custom Modal */}
      {modal.show && (
        <div className="my-modal-overlay" onClick={closeModal}>
          <div className="my-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="my-modal-header">
              <h2 className="my-modal-title">{modal.title}</h2>
              <button className="my-modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            
            <div className="my-modal-body">
              {modal.type === "cancel" && modal.data && (
                <div className="my-refund-info">
                  <p className="my-modal-desc">
                    {modal.data.isToday 
                      ? "Note: Cancellation on the same day as the event incurs a 40% deduction fee."
                      : "Note: Standard cancellation incurs a 20% deduction fee."}
                  </p>
                  <div className="my-refund-grid">
                    <div className="my-refund-item">
                      <span>Total Paid</span>
                      <strong>₹{modal.data.total}</strong>
                    </div>
                    <div className="my-refund-item">
                      <span>Deduction ({modal.data.rate}%)</span>
                      <strong className="text-danger">- ₹{modal.data.deduction.toFixed(2)}</strong>
                    </div>
                    <div className="my-refund-divider" />
                    <div className="my-refund-item total">
                      <span>Refund Amount</span>
                      <strong className="text-success">₹{modal.data.refund.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )}
              
              {(modal.type === "confirm" || modal.type === "success") && (
                <p className="my-modal-message">{modal.message}</p>
              )}
            </div>

            <div className="my-modal-footer">
              {modal.type === "success" ? (
                <button className="my-modal-btn primary" onClick={closeModal}>Awesome!</button>
              ) : (
                <>
                  <button className="my-modal-btn secondary" onClick={closeModal}>Keep it</button>
                  <button 
                    className={`my-modal-btn ${modal.type === "cancel" ? "danger" : "primary"}`} 
                    onClick={modal.onConfirm}
                  >
                    {modal.type === "cancel" ? "Confirm Cancellation" : "Yes, Remove"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ ticket, onCancel, onDelete, navigate, isHistory }) => (
  <div className={`my-bk-ticket-card ${isHistory ? "is-history" : ""}`}>
    {/* Poster */}
    <div className="my-bk-poster-wrap">
      <img src={ticket.moviePoster} alt={ticket.movieTitle} className="my-bk-poster" />
      <span className="my-bk-genre">{ticket.movieGenre?.split("/")[0]}</span>
    </div>

    {/* Tear */}
    <div className="my-bk-tear">
      <div className="my-bk-notch top" />
      <div className="my-bk-dash" />
      <div className="my-bk-notch bottom" />
    </div>

    {/* Details */}
    <div className="my-bk-info">
      <div className="my-bk-info-top">
        <div style={{ flex: 1 }}>
          <h3 className="my-bk-movie-name">{ticket.movieTitle}</h3>
          <p className="my-bk-movie-dur">{ticket.movieDuration}</p>
          <span className="my-bk-id-badge">{ticket.bookingId}</span>
        </div>
        <div className="my-bk-qr-mini" style={{ filter: isHistory ? "grayscale(1)" : "none" }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ticket.bookingId}`} 
            alt="QR Stub" 
          />
        </div>
      </div>

      <div className="my-bk-meta-row">
        <span><MapPin size={13} /> {ticket.theater}</span>
        <span><Calendar size={13} /> {ticket.date}</span>
        <span><Clock size={13} /> {ticket.show}</span>
      </div>

      <div className="my-bk-seats-row">
        {ticket.seats.map((s) => (
          <span key={s} className="my-bk-seat-chip">{s}</span>
        ))}
      </div>

      {ticket.orderedFood && ticket.orderedFood.length > 0 && (
        <div className="service-tracker-container" style={{ marginTop: "8px", padding: "12px", background: "#f8f9fa", borderRadius: "10px", border: "1.5px solid #eee" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#111', display: 'flex', alignItems: 'center', gap: '5px' }}>
              🍿 SEAT SERVICE TRACKING
            </span>
            <span style={{ fontSize: '10px', color: '#f84464', fontWeight: '800', textTransform: 'uppercase' }}>
              {ticket.deliveryPreference === 'interval' ? 'At Interval' : 'Before Show'}
            </span>
          </div>
          
          <div className="tracking-progress-bar" style={{ height: '6px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden', position: 'relative', marginBottom: '8px' }}>
            <div style={{ 
              width: ticket.deliveryStatus === 'Delivered' ? '100%' : ticket.deliveryStatus === 'On the way' ? '66%' : '33%', 
              height: '100%', 
              background: 'linear-gradient(90deg, #f84464, #ff6b81)', 
              borderRadius: '10px',
              transition: 'width 1s ease-in-out'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700', color: '#888' }}>
            <span style={{ color: ticket.deliveryStatus === 'Preparing' ? '#f84464' : '#888' }}>Preparing</span>
            <span style={{ color: ticket.deliveryStatus === 'On the way' ? '#f84464' : '#888' }}>On the way</span>
            <span style={{ color: ticket.deliveryStatus === 'Delivered' ? '#f84464' : '#888' }}>Delivered</span>
          </div>
          
          <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#555", fontStyle: "italic" }}>
            {ticket.deliveryStatus === 'Preparing' ? "👩‍🍳 Your snacks are being freshly prepared." : 
             ticket.deliveryStatus === 'On the way' ? "🏃‍♂️ Popcorn is on the way to your seat!" : 
             "✅ Enjoy your snacks! Service complete."}
          </p>
        </div>
      )}

      <div className="my-bk-bottom-row">
        <span className="my-bk-amount">₹{ticket.totalAmount}</span>
        <div className="my-bk-actions">
          {isHistory ? (
            <button
              className="my-bk-del-btn"
              onClick={onDelete}
              title="Delete from history"
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <button
              className="my-bk-cancel-btn"
              onClick={onCancel}
              style={{
                background: "#fff0f0",
                color: "#E50914",
                border: "1px solid #ffd0d0",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => { e.target.style.background = "#E50914"; e.target.style.color = "white"; }}
              onMouseOut={(e) => { e.target.style.background = "#fff0f0"; e.target.style.color = "#E50914"; }}
            >
              <X size={14} /> Cancel
            </button>
          )}
          <button
            className="my-bk-detail-btn"
            onClick={() => {
              if (ticket.isSport) {
                navigate(`/sports-detail/${ticket.eventId}`);
              } else if (ticket.isMusic) {
                navigate(`/music-detail/${ticket.eventId}`);
              } else {
                navigate(`/movie/${encodeURIComponent(ticket.movieTitle)}`);
              }
            }}
            style={{ cursor: "pointer", background: isHistory ? "#666" : "#111" }}
          >
            {ticket.isSport ? "Sports Info" : ticket.isMusic ? "Music Info" : "Movie Info"} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Bookings;
