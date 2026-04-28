import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="home-footer">
      <div className="home-footer-content">
        <h2 className="footer-logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>ShowBuzz</h2>
        <p className="footer-desc">
          The ultimate destination for booking movies, sports events, and music concerts. 
          Experience the magic of entertainment with seamless booking and exclusive offers.
        </p>
        <div className="footer-links">
          <span>About Us</span>
          <span>Contact</span>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
        </div>
        <p className="footer-copy">© 2026 ShowBuzz. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
