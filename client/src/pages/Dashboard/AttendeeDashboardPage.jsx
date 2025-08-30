import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock4
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import './AttendeeDashboardPage.css';

const AttendeeDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/my-bookings');
        setBookings(response.data.bookings || []);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
        setError('Failed to load your tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    );
  }

  // Calculate upcoming and past events
  const now = new Date();
  const upcomingBookings = bookings.filter(booking => new Date(booking.event.date) >= now);
  const pastBookings = bookings.filter(booking => new Date(booking.event.date) < now);

  // Render upcoming events
  const renderUpcomingEvents = () => {
    if (upcomingBookings.length === 0) {
      return (
        <div className="empty-state">
          <Calendar size={48} className="empty-icon" />
          <h3>No upcoming events</h3>
          <p>You don't have any upcoming events. Start exploring events to book your next experience!</p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      );
    }

    return (
      <div className="booking-grid">
        {upcomingBookings.map(booking => (
          <div key={booking._id} className="booking-card">
            <div className="booking-card-header">
              <h3>{booking.event.title}</h3>
              <span className={`status-badge ${booking.status.toLowerCase()}`}>
                {booking.status}
              </span>
            </div>
            <div className="booking-card-date">
              <Calendar size={16} />
              <div>
                <div>{format(new Date(booking.event.date), 'EEEE, MMMM d, yyyy')}</div>
                <div className="text-sm">
                  {format(new Date(booking.event.startTime), 'h:mm a')} - {format(new Date(booking.event.endTime), 'h:mm a')}
                </div>
              </div>
            </div>
            <div className="booking-card-location">
              <MapPin size={16} />
              <span>{booking.event.location}</span>
            </div>
            <div className="booking-card-footer">
              <div className="ticket-info">
                <span className="ticket-count">{booking.tickets.length} {booking.tickets.length === 1 ? 'ticket' : 'tickets'}</span>
                <span className="ticket-amount">₹{booking.totalAmount.toFixed(2)}</span>
              </div>
              <Link to={`/tickets/${booking._id}`} className="btn-primary">
                View Ticket
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render past events
  const renderPastEvents = () => {
    if (pastBookings.length === 0) return null;

    return (
      <section className="past-events-section">
        <h3>Past Events</h3>
        <div className="past-events-list">
          {pastBookings.map(booking => (
            <div key={`past-${booking._id}`} className="past-event-item">
              <div className="past-event-details">
                <h4>{booking.event.title}</h4>
                <div className="past-event-meta">
                  <span>{format(new Date(booking.event.date), 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <span>{booking.event.location}</span>
                </div>
              </div>
              <Link to={`/events/${booking.event._id}/review`} className="btn-text">
                Leave a Review
              </Link>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="attendee-dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p>Here's an overview of your event tickets and activities.</p>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3><Ticket size={18} /> Total Tickets</h3>
          <p>{bookings.reduce((sum, booking) => sum + booking.tickets.length, 0)}</p>
        </div>
        <div className="stat-card">
          <h3><Calendar size={18} /> Upcoming Events</h3>
          <p>{upcomingBookings.length}</p>
        </div>
        <div className="stat-card">
          <h3><CheckCircle2 size={18} /> Attended</h3>
          <p>{pastBookings.length}</p>
        </div>
      </div>

      {/* Upcoming Events */}
      <section className="upcoming-events">
        <div className="section-header">
          <h2>Upcoming Events</h2>
          <Link to="/events" className="view-all">
            View All Events <ArrowRight size={16} />
          </Link>
        </div>
        {renderUpcomingEvents()}
      </section>

      {/* Past Events */}
      {renderPastEvents()}

      {/* Quick Actions */}
      <section className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-cards">
          <Link to="/events" className="action-card">
            <div className="action-icon">
              <Calendar size={24} />
            </div>
            <h4>Browse Events</h4>
            <p>Discover new events and book your tickets</p>
          </Link>
          <Link to="/profile" className="action-card">
            <div className="action-icon">
              <User size={24} />
            </div>
            <h4>Manage Profile</h4>
            <p>Update your personal information</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AttendeeDashboardPage;
