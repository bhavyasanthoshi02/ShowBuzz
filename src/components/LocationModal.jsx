import React, { useState } from "react";
import { X } from "lucide-react";
import "../styles/location.css";

const cities = [
    { name: "Hyderabad", img: "https://images.unsplash.com/photo-1587572236558-a3751c6d42c0?w=150&q=80" },
    { name: "Chennai", img: "https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?w=150&q=80" },
    { name: "Mumbai", img: "https://images.unsplash.com/photo-1522256676378-4352fb189f7f?w=150&q=80" },
    { name: "Bangalore", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=150&q=80" },
    { name: "Delhi", img: "https://images.unsplash.com/photo-1587474260580-b08e2f8d070b?w=150&q=80" },
    { name: "Kochi", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=150&q=80" },
    { name: "Pune", img: "https://images.unsplash.com/photo-1572911142566-6b2f6efba983?w=150&q=80" },
    { name: "Kolkata", img: "https://images.unsplash.com/photo-1558431382-27e303142255?w=150&q=80" }
];

const LocationModal = ({ onClose, setLocation }) => {
    const [loading, setLoading] = useState(false);

    const detectLocation = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();
                    const city =
                        data.address.city ||
                        data.address.town ||
                        data.address.state;

                    setLocation(city || "Unknown");
                    localStorage.setItem("location", city || "Unknown");
                    onClose();
                } catch (error) {
                    console.error("Error detecting location:", error);
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                alert("Could not access your location. Please allow location permissions.");
                setLoading(false);
            }
        );
    };

    return (
        <div className="location-modal" onClick={onClose}>
            <div className="location-box" onClick={(e) => e.stopPropagation()}>
                <div className="location-header">
                    <h3>Select City</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <button 
                    className="detect-btn" 
                    onClick={detectLocation}
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
                >
                    {loading ? "Detecting..." : "Detect my location"}
                </button>

                <div className="city-grid">
                    {cities.map((c, i) => (
                        <div
                            key={i}
                            className="city-card"
                            onClick={() => {
                                setLocation(c.name);
                                localStorage.setItem("location", c.name);
                                onClose();
                            }}
                        >
                            <img 
                                src={c.img} 
                                alt={c.name} 
                                onError={(e) => {
                                    e.target.onerror = null; // Prevent infinite loop
                                    e.target.src = "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=150&q=80";
                                }}
                            />
                            <span>{c.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LocationModal;