import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import StockPage from '../pages/StockPage/StockPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/stocks" replace />} />
      <Route path="/stocks" element={<StockPage />} />
      {/* Add more routes here as you build new pages */}
      {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
      {/* <Route path="/settings" element={<SettingsPage />} /> */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
