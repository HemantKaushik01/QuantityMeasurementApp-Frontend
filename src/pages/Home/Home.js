import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRepeat, FiSettings, FiClock } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <div className="hero-banner" id="hero-banner">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <h1 className="hero-title">Welcome To Quantity Measurement</h1>
        <p className="hero-subtitle">Convert, compare, and calculate between units instantly with precision</p>
      </div>

      <div className="home-container">
        <h2 className="home-section-title">Select an Action</h2>
        <div className="home-cards">
          {/* Compare & Convert */}
          <div 
            className="home-card" 
            onClick={() => navigate('/convert')}
          >
            <div className="home-card-icon-wrapper convert-icon">
              <FiRepeat className="home-card-icon" />
            </div>
            <h3 className="home-card-title">Compare & Convert</h3>
            <p className="home-card-desc">Convert values between units or compare two quantities directly.</p>
          </div>

          {/* Operations */}
          <div 
            className="home-card" 
            onClick={() => navigate('/operations')}
          >
            <div className="home-card-icon-wrapper operations-icon">
              <FiSettings className="home-card-icon" />
            </div>
            <h3 className="home-card-title">Operations</h3>
            <p className="home-card-desc">Perform addition, subtraction, multiplication, and division on quantities.</p>
          </div>

          {/* History */}
          <div 
            className="home-card" 
            onClick={() => navigate('/history')}
          >
            <div className="home-card-icon-wrapper history-icon">
              <FiClock className="home-card-icon" />
            </div>
            <h3 className="home-card-title">History</h3>
            <p className="home-card-desc">View your previous conversions, comparisons, and calculation results.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
