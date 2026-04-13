import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Converter from './components/Converter/Converter';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import History from './pages/History/History';
import InteractiveBackground from './components/InteractiveBackground/InteractiveBackground';
import './App.css';

function App() {
  useEffect(() => {
    // Check for token in URL from OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Decode JWT to get user email and name
      let userEmail = '';
      let userName = 'User';
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        userEmail = payload.email || payload.sub || '';
        userName = payload.name || payload.given_name || (userEmail ? userEmail.split('@')[0] : 'User');
      } catch (e) {
        console.error("Failed to parse token", e);
      }
      
      localStorage.setItem('user', JSON.stringify({ name: userName, email: userEmail }));
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Auto reload the page to refresh Navbar state
      window.location.reload();
    }
  }, []);

  return (
    <Router>
      <InteractiveBackground />
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/convert" element={<Converter initialMode="convert" />} />
          <Route path="/operations" element={<Converter initialMode="operations" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
