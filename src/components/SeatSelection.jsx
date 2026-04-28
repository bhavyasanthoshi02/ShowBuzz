import React, { useState, useMemo, useEffect } from "react";
import { X, Users, MapPin, Send, Share2, Smile, CreditCard, MessageSquare, CheckCircle2, UserPlus, Sparkles } from "lucide-react";
import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import "./SeatSelection.css";

const SeatSelection = ({ title, type, onConfirm, onClose, sessionId, requiredSeats }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [sessionData, setSessionData] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const user = auth.currentUser;
  const userId = user?.uid || "guest";
  const userName = user?.displayName || user?.email?.split('@')[0] || "Guest";

  // Assign a unique color to the current user
  const userColor = useMemo(() => {
    const colors = ["#F84464", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Sync with Firestore if sessionId is provided
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "booking_sessions", sessionId);
    
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSessionData(data);
        
        // Sync local selected seats (only those selected by THIS user)
        const mySeats = Object.entries(data.seats || {})
          .filter(([_, info]) => info.userId === userId)
          .map(([id, _]) => id);
        setSelectedSeats(mySeats);
      } else {
        // Initialize session if it doesn't exist
        setDoc(sessionRef, {
          title,
          type,
          seats: {},
          participants: {
            [userId]: { name: userName, status: "joined", color: userColor }
          },
          chat: []
        });
      }
    });

    return () => unsubscribe();
  }, [sessionId, userId]);

  // Join session if not already in
  useEffect(() => {
    if (sessionId && sessionData && !sessionData.participants[userId]) {
      const sessionRef = doc(db, "booking_sessions", sessionId);
      updateDoc(sessionRef, {
        [`participants.${userId}`]: { name: userName, status: "joined", color: userColor }
      });
    }
  }, [sessionId, sessionData, userId]);
  
  // High-Quality Layout Generator
  const layout = useMemo(() => {
    const seats = [];
    if (type === "sport") {
      const centerX = 450;
      const centerY = 450; 
      const rings = [
        { radius: 200, count: 28, price: 3000, cat: "VIP" },
        { radius: 260, count: 40, price: 1800, cat: "Club" },
        { radius: 320, count: 52, price: 1000, cat: "Stand" },
        { radius: 380, count: 64, price: 500,  cat: "Gallery" }
      ];

      rings.forEach(ring => {
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2;
          seats.push({
            id: `${ring.cat[0]}${i + 1}`,
            x: centerX + Math.cos(angle) * ring.radius,
            y: centerY + Math.sin(angle) * ring.radius,
            price: ring.price,
            category: ring.cat,
            angle: (angle * 180) / Math.PI + 90
          });
        }
      });
      return { kind: "stadium", seats };
    } else {
      // CINEMATIC CURVED THEATER LAYOUT (REFINED SPACING)
      const rows = [
        { row: "A", radius: 630, price: 450, cat: "VIP" },
        { row: "B", radius: 590, price: 450, cat: "VIP" },
        { row: "C", radius: 550, price: 320, cat: "Premium" },
        { row: "D", radius: 510, price: 320, cat: "Premium" },
        { row: "E", radius: 470, price: 250, cat: "Standard" },
        { row: "F", radius: 430, price: 250, cat: "Standard" },
        { row: "G", radius: 390, price: 200, cat: "Standard" },
        { row: "H", radius: 350, price: 200, cat: "Standard" },
        { row: "I", radius: 310, price: 180, cat: "Economy" },
        { row: "J", radius: 270, price: 180, cat: "Economy" },
        { row: "K", radius: 230, price: 150, cat: "Economy" },
        { row: "L", radius: 190, price: 150, cat: "Economy" }
      ];

      const centerX = 400; 
      const focusY = -80; 
      const seatLinearGap = 30; // Slightly tighter spacing for more seats

      rows.forEach((rowInfo) => {
        // Calculate arc length to determine seat count for consistent spacing
        // spanAngle = arcLength / radius
        // We want arcLength to be roughly proportional to radius
        const spanAngle = Math.min(1.2, (rowInfo.radius * 0.003) + 0.4); 
        const arcLength = rowInfo.radius * spanAngle;
        const count = Math.floor(arcLength / seatLinearGap);
        
        const startAngle = Math.PI / 2 - spanAngle / 2;
        
        for (let i = 0; i < count; i++) {
          const angle = startAngle + (i / (count - 1)) * spanAngle;
          
          // Improved Aisle Logic: Create 2 main vertical aisles
          const sectionWidth = count / 4;
          const isAisle = (i === Math.floor(sectionWidth)) || (i === Math.floor(count - sectionWidth));
          if (isAisle) continue;

          seats.push({
            id: `${rowInfo.row}${i + 1}`,
            x: centerX + Math.cos(angle) * rowInfo.radius,
            y: focusY + Math.sin(angle) * rowInfo.radius + 150, // Offset to fit in view
            price: rowInfo.price,
            category: rowInfo.cat,
            angle: (angle * 180) / Math.PI - 90 // Facing the focus point
          });
        }
      });
      return { kind: "theater", seats };
    }
  }, [type]);

  const occupied = useMemo(() => {
    // Generate some random occupied seats for realism
    return layout.seats
      .filter(() => Math.random() < 0.15)
      .map(s => s.id);
  }, [layout]);

  // AI Predictive Seating: Suggest seats based on history
  const aiSuggestedSeats = useMemo(() => {
    const history = JSON.parse(localStorage.getItem(`showbuzz_bookings_${userId}`) || "[]");
    if (history.length === 0) {
      // Default suggestion if no history: center seats in VIP/Premium
      return layout.seats
        .filter(s => (s.category === "VIP" || s.category === "Premium") && s.id.includes("4"))
        .map(s => s.id);
    }

    // Extract preferred row initials (e.g., 'A', 'B')
    const preferredRows = history.map(b => b.seats?.[0]?.[0]).filter(Boolean);
    const topRow = preferredRows.sort((a,b) => preferredRows.filter(v => v===a).length - preferredRows.filter(v => v===b).length).pop();

    return layout.seats
      .filter(s => s.id.startsWith(topRow) && !occupied.includes(s.id))
      .slice(0, 4)
      .map(s => s.id);
  }, [layout, userId, occupied]);

  const toggleSeat = async (id) => {
    if (occupied.includes(id)) return;
    
    if (sessionId) {
      const sessionRef = doc(db, "booking_sessions", sessionId);
      const isSelectedByOther = sessionData?.seats[id] && sessionData.seats[id].userId !== userId;
      
      if (isSelectedByOther) return; // Locked by someone else

      const isAlreadySelectedByMe = selectedSeats.includes(id);
      
      if (isAlreadySelectedByMe) {
        // Remove from Firestore
        const updatedSeats = { ...sessionData.seats };
        delete updatedSeats[id];
        await updateDoc(sessionRef, { seats: updatedSeats });
      } else {
        // Enforce seat count in collab mode if possible
        if (requiredSeats && selectedSeats.length >= requiredSeats) return;
        // Add to Firestore
        await updateDoc(sessionRef, {
          [`seats.${id}`]: { userId, color: userColor, name: userName }
        });
      }
    } else {
      if (selectedSeats.includes(id)) {
        setSelectedSeats(selectedSeats.filter(s => s !== id));
      } else {
        if (requiredSeats && selectedSeats.length >= requiredSeats) return;
        setSelectedSeats([...selectedSeats, id]);
      }
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim() || !sessionId) return;
    const sessionRef = doc(db, "booking_sessions", sessionId);
    await updateDoc(sessionRef, {
      chat: arrayUnion({
        userId,
        userName,
        text: chatMessage,
        timestamp: Date.now(),
        color: userColor
      })
    });
    setChatMessage("");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/book/${encodeURIComponent(title)}?session=${sessionId}`;
    navigator.clipboard.writeText(url);
    alert("Invite link copied to clipboard!");
  };

  const getPrice = () => {
    const base = type === "movie" ? 300 : type === "sport" ? 600 : 1500;
    return selectedSeats.length * base;
  };

  const canConfirm = requiredSeats ? selectedSeats.length === requiredSeats : selectedSeats.length > 0;

  return (
    <div className="seat-modal-overlay">
      <div className={`seat-modal-container pro-layout ${sessionId ? 'collab-mode' : ''}`}>
        <div className="seat-modal-header">
          <div className="header-top">
            <div className="title-group">
              <span className="layout-badge">{type === "sport" ? "Stadium View" : "Hall View"}</span>
              <h3>{title}</h3>
              <p className="venue-meta"><MapPin size={14} /> Global Interactive Arena</p>
            </div>
            <div className="header-actions">
              {sessionId && (
                <button className="collab-share-btn" onClick={handleShare}>
                  <Share2 size={18} /> Invite Friends
                </button>
              )}
              <button className="seat-close-btn" onClick={onClose}><X size={24} /></button>
            </div>
          </div>

          {sessionId && (
            <div className="who-is-coming">
              <p className="tracker-label">Who's Coming?</p>
              <div className="participants-scroll no-scrollbar">
                {Object.entries(sessionData?.participants || {}).map(([pid, p]) => (
                  <div key={pid} className="participant-avatar-wrapper" title={`${p.name} (${p.status})`}>
                    <div 
                      className="participant-avatar" 
                      style={{ border: `3px solid ${p.color}`, background: `${p.color}22`, color: p.color }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`status-dot ${p.status}`} />
                  </div>
                ))}
                <button className="add-participant-btn" onClick={handleShare}>
                  <UserPlus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="main-booking-area">
          <div className="layout-viewport">
            <div className="layout-canvas-pro">
              {type === "sport" ? (
                <div className="stadium-pitch-circle">
                  <div className="pitch-center-dot" />
                  <div className="pitch-crease" />
                  <p>PLAYING FIELD</p>
                </div>
              ) : (
                <div className="theater-stage">
                  <div className="stage-glow" />
                  <p>STAGE / SCREEN</p>
                </div>
              )}

              <div className="radial-seats">
                {layout.seats.map(seat => {
                  const isOccupied = occupied.includes(seat.id);
                  const seatInfo = sessionData?.seats[seat.id];
                  const isSelectedByMe = selectedSeats.includes(seat.id);
                  const isSelectedByOther = sessionId && seatInfo && seatInfo.userId !== userId;
                  const isAiSuggested = aiSuggestedSeats.includes(seat.id) && !isSelectedByMe && !isSelectedByOther;
                  
                  return (
                    <div 
                      key={seat.id}
                      className={`radial-seat ${isOccupied ? 'occupied' : ''} ${isSelectedByMe ? 'selected' : ''} ${isSelectedByOther ? 'selected-other' : ''} ${isAiSuggested ? 'ai-suggested' : ''}`}
                      data-category={seat.category}
                      style={{
                        left: `${seat.x}px`,
                        top: `${seat.y}px`,
                        transform: `translate(-50%, -50%) rotate(${seat.angle}deg)`,
                        ...(isSelectedByOther ? { backgroundColor: seatInfo.color, borderColor: seatInfo.color } : {})
                      }}
                      onClick={() => toggleSeat(seat.id)}
                    >
                      <div className="seat-indicator" />
                      {isAiSuggested && <div className="ai-badge"><Sparkles size={8} fill="white" /></div>}
                      {isSelectedByOther && <div className="user-initial">{seatInfo.name.charAt(0)}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {sessionId && showChat && (
            <div className="collab-sidebar">
              <div className="chat-container">
                <div className="chat-header">
                  <MessageSquare size={16} />
                  <span>Group Coordination</span>
                  <button className="close-chat" onClick={() => setShowChat(false)}><X size={14} /></button>
                </div>
                <div className="chat-messages no-scrollbar">
                  {sessionData?.chat?.map((msg, i) => (
                    <div key={i} className={`chat-bubble ${msg.userId === userId ? 'mine' : 'theirs'}`}>
                      <div className="msg-user" style={{ color: msg.color }}>{msg.userName}</div>
                      <div className="msg-text">{msg.text}</div>
                    </div>
                  ))}
                </div>
                <div className="quick-reactions">
                  {['🔥', '😂', '👍', '🎟️', '🍕'].map(emoji => (
                    <button key={emoji} onClick={() => { setChatMessage(emoji); sendMessage(); }}>{emoji}</button>
                  ))}
                </div>
                <div className="chat-input-area">
                  <input 
                    type="text" 
                    placeholder="Type coordination msg..." 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage}><Send size={16} /></button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="seat-modal-footer-pro">
          <div className="footer-left">
            <div className="legend-pro">
              <div className="legend-item"><div className="color-box available" /> Available</div>
              <div className="legend-item"><div className="color-box selected" /> Selected</div>
              <div className="legend-item"><div className="color-box ai-suggested" /> AI Suggested</div>
              {sessionId && <div className="legend-item"><div className="color-box selected-other" /> Selected by others</div>}
              <div className="legend-item"><div className="color-box occupied" /> Occupied</div>
            </div>

            {sessionId && (
              <div className="split-payment-preview">
                <div className="split-info">
                  <CreditCard size={16} />
                  <span>Split Payment: ₹{(getPrice() / (Object.keys(sessionData?.participants || {}).length || 1)).toFixed(0)} / person</span>
                </div>
                <div className="payment-avatars">
                  {Object.values(sessionData?.participants || {}).map((p, i) => (
                    <div key={i} className="mini-avatar" style={{ backgroundColor: p.color }} title={p.name} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="booking-cta-pro">
            <div className="booking-info">
              <p className="seat-summary">
                {requiredSeats 
                  ? `${selectedSeats.length} / ${requiredSeats} Seats Selected` 
                  : `${selectedSeats.length} Seats Selected`
                }
              </p>
              <h2 className="total-amount">₹{getPrice()}</h2>
            </div>
            <button 
              className={`confirm-booking-btn ${!canConfirm ? 'disabled' : ''}`}
              disabled={!canConfirm}
              onClick={() => onConfirm(selectedSeats, getPrice())}
            >
              {requiredSeats && selectedSeats.length < requiredSeats 
                ? `Select ${requiredSeats - selectedSeats.length} more` 
                : <><Users size={18} /> Confirm & Pay</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
