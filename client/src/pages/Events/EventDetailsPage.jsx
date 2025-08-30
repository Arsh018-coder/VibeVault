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
        const response = await api.get(`/events/${slug}`);
        setEvent(response.data.event);
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
