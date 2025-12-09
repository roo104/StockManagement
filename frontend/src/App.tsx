import React from 'react';
import {BrowserRouter, Link} from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">Stock Analysis</div>
          <div className="nav-links">
            <Link to="/fundamental" className="nav-link">Analysis</Link>
            <Link to="/watchlist" className="nav-link">Watchlist</Link>
            <Link to="/growth-screening" className="nav-link">Growth Screening</Link>
            <Link to="/ipo-calendar" className="nav-link">IPO Calendar</Link>
          </div>
        </nav>
        <div className="container">
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
