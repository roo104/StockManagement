import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import FundamentalAnalysisPage from '../pages/FundamentalAnalysisPage/FundamentalAnalysisPage';
import WatchlistPage from '../pages/WatchlistPage/WatchlistPage';
import GrowthScreeningPage from '../pages/GrowthScreeningPage/GrowthScreeningPage';
import IpoCalendarPage from '../pages/IpoCalendarPage/IpoCalendarPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/fundamental" replace />} />
      <Route path="/fundamental" element={<FundamentalAnalysisPage />} />
      <Route path="/watchlist" element={<WatchlistPage />} />
      <Route path="/growth-screening" element={<GrowthScreeningPage />} />
      <Route path="/ipo-calendar" element={<IpoCalendarPage />} />
      {/* Add more routes here as you build new pages */}
      {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
      {/* <Route path="/settings" element={<SettingsPage />} /> */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
