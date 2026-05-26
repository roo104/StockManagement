import {Navigate, Route, Routes} from 'react-router-dom';
import {AppShell} from '@/layouts/AppShell';
import DashboardPage from '@/pages/DashboardPage/DashboardPage';
import FundamentalAnalysisPage from '@/pages/FundamentalAnalysisPage/FundamentalAnalysisPage';
import WatchlistPage from '@/pages/WatchlistPage/WatchlistPage';
import NewsPage from '@/pages/NewsPage/NewsPage';
import GrowthScreeningPage from '@/pages/GrowthScreeningPage/GrowthScreeningPage';
import IpoCalendarPage from '@/pages/IpoCalendarPage/IpoCalendarPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
        <Route element={<AppShell/>}>
            <Route index element={<DashboardPage/>}/>
            <Route path="/analysis" element={<FundamentalAnalysisPage/>}/>
            <Route path="/analysis/:symbol" element={<FundamentalAnalysisPage/>}/>
            <Route path="/watchlist" element={<WatchlistPage/>}/>
            <Route path="/news" element={<NewsPage/>}/>
            <Route path="/screening" element={<GrowthScreeningPage/>}/>
            <Route path="/ipo" element={<IpoCalendarPage/>}/>

            {/* Legacy redirects */}
            <Route path="/fundamental" element={<Navigate to="/analysis" replace/>}/>
            <Route path="/growth-screening" element={<Navigate to="/screening" replace/>}/>
            <Route path="/ipo-calendar" element={<Navigate to="/ipo" replace/>}/>

            <Route path="*" element={<NotFoundPage/>}/>
        </Route>
    </Routes>
  );
}
