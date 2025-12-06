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
            <Link to="/stocks" className="nav-link">Stock Charts</Link>
            <Link to="/fundamental" className="nav-link">Fundamental Analysis</Link>
            <Link to="/watchlist" className="nav-link">Watchlist</Link>
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
