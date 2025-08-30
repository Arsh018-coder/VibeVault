import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './EventDetailsPage.css';
import { format } from 'date-fns';

const EventDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Mock data lookup by slug for now
        const mockEvents = [
          {
            id: 1,
            slug: 'tech-conference-2025',
            title: 'Tech Conference 2025',
            description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative technologies.',
            dateTime: { start: '2025-12-15T09:00:00Z' },
            location: { type: 'physical', venue: { name: 'Mumbai Convention Center' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Tech+Conference+2024', alt: 'Tech Conference' }],
            tickets: [
              { _id: 1, type: 'early-bird', name: 'Early Bird', price: 1999, quantity: { available: 50, total: 100 }, saleWindow: { start: '2025-10-01', end: '2025-12-14' } },
              { _id: 2, type: 'regular', name: 'Regular', price: 2499, quantity: { available: 200, total: 300 }, saleWindow: { start: '2025-10-01', end: '2025-12-14' } },
              { _id: 3, type: 'vip', name: 'VIP', price: 3999, quantity: { available: 25, total: 50 }, saleWindow: { start: '2025-10-01', end: '2025-12-14' } }
            ]
          },
          {
            id: 2,
            slug: 'bollywood-music-festival',
            title: 'Bollywood Music Festival',
            description: 'Experience amazing live music from top Bollywood artists in a beautiful outdoor setting.',
            dateTime: { start: '2025-11-20T18:00:00Z' },
            location: { type: 'physical', venue: { name: 'Palace Grounds' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Bollywood+Music+Festival', alt: 'Music Festival' }],
            tickets: [
              { _id: 4, type: 'early-bird', name: 'Early Bird', price: 999, quantity: { available: 100, total: 150 }, saleWindow: { start: '2025-09-01', end: '2025-11-19' } },
              { _id: 5, type: 'regular', name: 'Regular', price: 1299, quantity: { available: 1500, total: 1800 }, saleWindow: { start: '2025-09-01', end: '2025-11-19' } },
              { _id: 6, type: 'vip', name: 'VIP', price: 2999, quantity: { available: 150, total: 200 }, saleWindow: { start: '2025-09-01', end: '2025-11-19' } }
            ]
          }
        ];

        const foundEvent = mockEvents.find(e => e.slug === slug);
        
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!event) {
    return <div className="error-message">Event not found.</div>;
  }

  const eventDate = event.dateTime?.start ? new Date(event.dateTime.start) : null;

  return (
    <div className="container event-details-page">
      <div className="event-header">
        <h1 className="event-title">{event.title}</h1>
        {eventDate && (
          <p className="event-date">{format(eventDate, 'EEEE, MMMM do, yyyy p')}</p>
        )}
        <p className="event-location">
          {event.location.type === 'physical' ? event.location.venue?.name : 'Online Event'}
        </p>
      </div>

      <div className="event-image-carousel">
        {event.images?.length ? (
          event.images.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={img.alt || event.title}
              className="event-image"
            />
          ))
        ) : (
          <div className="event-image-placeholder">No images</div>
        )}
      </div>

      <section className="event-description">
        <h2>Description</h2>
        <p>{event.description}</p>
      </section>

      <section className="event-ticketing">
        <h2>Tickets</h2>
        {event.tickets?.length ? (
          <ul className="ticket-list">
            {event.tickets.map(ticket => (
              <li key={ticket._id} className="ticket-item">
                <h3>{ticket.name} - ₹{ticket.price}</h3>
                <p>Available: {ticket.quantity.available} / {ticket.quantity.total}</p>
                <p>Sale: {format(new Date(ticket.saleWindow.start), 'PPP')} – {format(new Date(ticket.saleWindow.end), 'PPP')}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tickets available.</p>
        )}
        <button 
          className="btn btn-primary"
          onClick={() => navigate(`/events/${slug}/book`)}
        >
          Book Tickets
        </button>
      </section>
    </div>
  );
};

export default EventDetailsPage;
