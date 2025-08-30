import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from '../pages/Home/HomePage';
import EventsPage from '../pages/Events/EventsPage';
import EventDetailsPage from '../pages/Events/EventDetailsPage';
import EventBookingPage from '../pages/Events/EventBookingPage';
import CategoriesPage from '../pages/Categories/CategoriesPage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import VerifyEmailPage from '../pages/Auth/VerifyEmailPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import CartPage from '../pages/Cart/CartPage';
import OrganizerDashboard from '../pages/Organizer/OrganizerDashboard';
import MyTicketsPage from '../pages/Profile/MyTicketsPage';
import NotFoundPage from '../pages/Error/404Page';
import { useAuth } from '../contexts/AuthContext';

// Layout component for protected routes
const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return <Outlet />;
};

// Role-based route protection
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:slug" element={<EventDetailsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedLayout />}>
        {/* Common protected routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        
        {/* Event booking */}
        <Route path="/events/:slug/book" element={<EventBookingPage />} />
        
        {/* Attendee routes */}
        <Route 
          path="/my-tickets" 
          element={
            <RoleRoute allowedRoles={['ATTENDEE', 'ORGANIZER']}>
              <MyTicketsPage />
            </RoleRoute>
          } 
        />

        {/* Organizer routes */}
        <Route 
          path="/organizer" 
          element={
            <RoleRoute allowedRoles={['ORGANIZER']}>
              <OrganizerDashboard />
            </RoleRoute>
          } 
        />
      </Route>

      {/* 404 - Keep this last */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
