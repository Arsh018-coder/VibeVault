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
import OrganizerDashboardPage from '../pages/Dashboard/OrganizerDashboardPage';
import AttendeeDashboardPage from '../pages/Dashboard/AttendeeDashboardPage';
import EventForm from '../components/features/events/EventForm/EventForm';
import MyTicketsPage from '../pages/Profile/MyTicketsPage';
import PaymentPage from '../pages/Payment/PaymentPage';
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

// Role-based dashboard redirect component
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'ORGANIZER') {
    return <Navigate to="/dashboard/organizer" replace />;
  } else if (user.role === 'ATTENDEE') {
    return <Navigate to="/dashboard/attendee" replace />;
  } else {
    // Default fallback or admin case
    return <Navigate to="/" replace />;
  }
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
        
        {/* Payment */}
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        
        {/* Dashboard routes - role-based */}
        <Route 
          path="/dashboard" 
          element={
            <RoleBasedDashboard />
          } 
        />
        
        {/* Attendee-specific routes */}
        <Route 
          path="/dashboard/attendee" 
          element={
            <RoleRoute allowedRoles={['ATTENDEE']}>
              <AttendeeDashboardPage />
            </RoleRoute>
          } 
        />
        
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
          path="/dashboard/organizer" 
          element={
            <RoleRoute allowedRoles={['ORGANIZER']}>
              <OrganizerDashboardPage />
            </RoleRoute>
          } 
        />
        
        <Route 
          path="/organizer/events/new" 
          element={
            <RoleRoute allowedRoles={['ORGANIZER']}>
              <EventForm />
            </RoleRoute>
          } 
        />
        
        <Route 
          path="/organizer/events/:eventId/edit" 
          element={
            <RoleRoute allowedRoles={['ORGANIZER']}>
              <EventForm />
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
