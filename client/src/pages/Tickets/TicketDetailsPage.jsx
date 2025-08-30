import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './TicketDetailsPage.css';

const TicketDetailsPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        setBooking(response.data.booking);
      } catch (error) {
        console.error('Failed to fetch booking', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!booking) {
    return <div className="error-message">Booking not found.</div>;
  }

  return (
    <div className="container ticket-details-page">
      <h2>Ticket Details for {booking.eventTitle}</h2>
      <section className="ticket-info">
        <p><strong>Booking ID:</strong> {booking.bookingId}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
        <p><strong>Total Paid:</strong> ₹{booking.pricing.total}</p>
      </section>

      <section className="attendees-list">
        <h3>Attendee Tickets</h3>
        <ul>
          {booking.attendees.map((attendee, idx) => (
            <li key={idx} className="attendee-item">
              <p><strong>Name:</strong> {attendee.name}</p>
              <p><strong>Email:</strong> {attendee.email}</p>
              <p><strong>Ticket Type:</strong> {attendee.ticketType}</p>
              <p><strong>Checked In:</strong> {attendee.checkedIn ? 'Yes' : 'No'}</p>
              {/* Placeholder for QR code if available */}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default TicketDetailsPage;
