import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import './AttendeeDashboardPage.css';

const AttendeeDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/my');
        setBookings(response.data.bookings || []);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
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
      </div>
    );
  }

  return (
    <div className="container attendee-dashboard-page">
      <h2>My Tickets</h2>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="booking-list">
          {bookings.map((booking) => (
            <li key={booking._id} className="booking-item">
              <div>
                <h3>{booking.eventTitle}</h3>
                <p>Tickets: {booking.tickets.length}</p>
                <p>Status: {booking.status}</p>
              </div>
              <Link to={`/tickets/${booking._id}`} className="btn btn-secondary">
                View Ticket
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttendeeDashboardPage;
