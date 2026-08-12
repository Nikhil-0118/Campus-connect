import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages
import Home from './pages/Home';
import Discover from './pages/Discover';
import ProfilePage from './pages/Profile';
import ProfileDetail from './pages/ProfileDetail';
import Connections from './pages/Connections';
import Teams from './pages/Teams';
import TeamCreate from './pages/TeamCreate';
import TeamDetail from './pages/TeamDetail';
import Marketplace from './pages/Marketplace';
import MarketplaceCreate from './pages/MarketplaceCreate';
import MarketplaceDetail from './pages/MarketplaceDetail';
import LostFound from './pages/LostFound';
import LostFoundCreate from './pages/LostFoundCreate';
import LostFoundDetail from './pages/LostFoundDetail';
import Events from './pages/Events';
import EventCreate from './pages/EventCreate';
import EventDetail from './pages/EventDetail';
import Notifications from './pages/Notifications';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<ProfileDetail />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/create" element={<TeamCreate />} />
              <Route path="/teams/:id" element={<TeamDetail />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/create" element={<MarketplaceCreate />} />
              <Route path="/marketplace/:id" element={<MarketplaceDetail />} />
              <Route path="/lost-found" element={<LostFound />} />
              <Route path="/lost-found/create" element={<LostFoundCreate />} />
              <Route path="/lost-found/:id" element={<LostFoundDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/create" element={<EventCreate />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
