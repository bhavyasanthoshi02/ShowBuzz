import React, { useState, useEffect } from 'react';

const images = [
    '/movie1.png',
    '/movie2.png',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=2070'
];

const Slideshow = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 7000); // Change every 7 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="slideshow-container">
            {images.map((img, index) => (
                <div
                    key={index}
                    className={`slide ${index === currentIndex ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${img})` }}
                >
                    <div className="slide-overlay"></div>
                </div>
            ))}
            
            {/* Pagination Dots */}
            <div className="pagination-dots">
                {images.map((_, index) => (
                    <div 
                        key={index} 
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default Slideshow;
