import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import './EventCard.css';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  
  const {
    id,
    slug,
    title,
    description,
    date,
    startAt,
    location,
    venueName,
    city,
    price,
    capacity,
    imageUrl,
    category,
    ticketTypes
  } = event;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle card click to navigate to event details
  const handleCardClick = (e) => {
    // Don't navigate if clicking on the book button
    if (e.target.closest('.book-button')) {
      return;
    }
    
    // Use slug if available, otherwise use id
    const eventIdentifier = slug || id;
    if (eventIdentifier) {
      navigate(`/events/${eventIdentifier}`);
    }
  };

  // Handle book button click
  const handleBookClick = (e) => {
    e.stopPropagation();
    const eventIdentifier = slug || id;
    if (eventIdentifier) {
      navigate(`/events/${eventIdentifier}/book`);
    }
  };

  // Get display date (prefer startAt over date)
  const displayDate = startAt || date;
  
  // Get display location
  const displayLocation = venueName || location || (city ? `${city}` : 'Location TBD');

  // Get price display (keep original logic simple)
  const displayPrice = price === 0 ? 'Free' : `₹${price}`;

  return (
    <div className="event-card" onClick={handleCardClick}>
      <div className="event-image">
        <img 
          src={imageUrl || '/api/placeholder/300/200'} 
          alt={title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Event+Image';
          }}
        />
        <div className="event-category">{category?.name || category}</div>
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{title}</h3>
        <p className="event-description">{description}</p>
        
        <div className="event-details">
          <div className="event-detail">
            <Calendar size={16} />
            <span>{formatDate(displayDate)}</span>
          </div>
          
          <div className="event-detail">
            <MapPin size={16} />
            <span>{displayLocation}</span>
          </div>
          
          <div className="event-detail">
            <Users size={16} />
            <span>{capacity} spots</span>
          </div>
        </div>
        
        <div className="event-footer">
          <div className="event-price">
            {displayPrice}
          </div>
          <button className="book-button" onClick={handleBookClick}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;