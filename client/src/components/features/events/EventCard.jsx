import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import './EventCard.css';

const EventCard = ({ event }) => {
  const {
    title,
    description,
    date,
    location,
    price,
    capacity,
    imageUrl,
    category
  } = event;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="event-card">
      <div className="event-image">
        <img 
          src={imageUrl || '/api/placeholder/300/200'} 
          alt={title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Event+Image';
          }}
        />
        <div className="event-category">{category}</div>
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{title}</h3>
        <p className="event-description">{description}</p>
        
        <div className="event-details">
          <div className="event-detail">
            <Calendar size={16} />
            <span>{formatDate(date)}</span>
          </div>
          
          <div className="event-detail">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
          
          <div className="event-detail">
            <Users size={16} />
            <span>{capacity} spots</span>
          </div>
        </div>
        
        <div className="event-footer">
          <div className="event-price">
            {price === 0 ? 'Free' : `₹${price}`}
          </div>
          <button className="book-button">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;