import React from 'react';
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
