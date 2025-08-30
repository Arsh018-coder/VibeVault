import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './EventCard.css';

const EventCard = ({ event }) => {
  const { title, description, dateTime, location, tickets, images, slug } = event;

  const eventDate = dateTime?.start ? new Date(dateTime.start) : null;
  const primaryImage = images?.find(img => img.isPrimary) || images?.[0];

  const ticketPrice = tickets?.length ? Math.min(...tickets.map(t => t.price)) : null;

  return (
    <Link to={`/events/${slug}`} className="event-card">
      {primaryImage && (
        <img src={primaryImage.url} alt={primaryImage.alt || title} className="event-card-image" />
      )}
      <div className="event-card-content">
        <h3 className="event-card-title">{title}</h3>
        {eventDate && (
          <p className="event-card-date">
            {format(eventDate, 'PPP p')}
          </p>
        )}
        <p className="event-card-location">
          {location?.type === 'physical' ? location.venue?.name : 'Online Event'}
        </p>
        <p className="event-card-price">
          {ticketPrice !== null ? `Starting from ₹${ticketPrice}` : 'Free'}
        </p>
        <p className="event-card-description">
          {description.length > 100 ? description.substring(0, 100) + '...' : description}
        </p>
      </div>
    </Link>
  );
};

export default EventCard;
