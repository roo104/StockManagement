import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="container">
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
