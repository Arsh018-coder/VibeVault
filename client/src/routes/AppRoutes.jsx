import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/Home/HomePage';
import EventsPage from '../pages/Events/EventsPage';
import EventDetailsPage from '../pages/Events/EventDetailsPage';
import CategoriesPage from '../pages/Categories/CategoriesPage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import OrganizerDashboardPage from '../pages/Dashboard/OrganizerDashboardPage';
import AttendeeDashboardPage from '../pages/Dashboard/AttendeeDashboardPage';
import MyTicketsPage from '../pages/Profile/MyTicketsPage';
import NotFoundPage from '../pages/Error/404Page';
import { useAuth } from '../contexts/AuthContext';

// ProtectedRoute Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:slug" element={<EventDetailsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute role="organizer">
            <OrganizerDashboardPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/my-tickets" 
        element={
          <ProtectedRoute>
            <MyTicketsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/attendee-dashboard" 
        element={
          <ProtectedRoute role="attendee">
            <AttendeeDashboardPage />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
