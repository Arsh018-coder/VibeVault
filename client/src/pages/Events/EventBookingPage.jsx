import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import './EventBookingPage.css';

const EventBookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Mock data lookup by slug (same as EventDetailsPage)
        const mockEvents = [
          {
            id: 1,
            slug: 'tech-conference-2025',
            title: 'Tech Conference 2025',
            description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative technologies.',
            startAt: '2025-12-15T09:00:00Z',
            endAt: '2025-12-15T18:00:00Z',
            venueName: 'Mumbai Convention Center',
            city: 'Mumbai',
            capacity: 500,
            category: { name: 'Technology' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Tech+Conference+2024',
            ticketTypes: [
              { id: 1, type: 'early-bird', name: 'Early Bird', price: 1999, qtyAvailable: 50, qtyTotal: 100 },
              { id: 2, type: 'regular', name: 'Regular', price: 2499, qtyAvailable: 200, qtyTotal: 300 },
              { id: 3, type: 'vip', name: 'VIP', price: 3999, qtyAvailable: 25, qtyTotal: 50 }
            ]
          },
          {
            id: 2,
            slug: 'bollywood-music-festival',
            title: 'Bollywood Music Festival',
            description: 'Experience amazing live music from top Bollywood artists in a beautiful outdoor setting.',
            startAt: '2025-11-20T18:00:00Z',
            endAt: '2025-11-20T23:00:00Z',
            venueName: 'Palace Grounds',
            city: 'Bangalore',
            capacity: 2000,
            category: { name: 'Music' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Bollywood+Music+Festival',
            ticketTypes: [
              { id: 4, type: 'early-bird', name: 'Early Bird', price: 999, qtyAvailable: 100, qtyTotal: 150 },
              { id: 5, type: 'regular', name: 'Regular', price: 1299, qtyAvailable: 1500, qtyTotal: 1800 },
              { id: 6, type: 'vip', name: 'VIP', price: 2999, qtyAvailable: 150, qtyTotal: 200 }
            ]
          }
        ];

        const foundEvent = mockEvents.find(e => e.slug === slug);

        if (foundEvent) {
          setEvent(foundEvent);
          // Initialize selected tickets
          const initialTickets = {};
          foundEvent.ticketTypes.forEach(ticket => {
            initialTickets[ticket.id] = 0;
          });
          setSelectedTickets(initialTickets);
        } else {
          toast.error('Event not found.');
          navigate('/events');
        }
      } catch (error) {
        toast.error('Failed to load event.');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug, navigate]);

  const handleTicketQuantityChange = (ticketId, quantity) => {
    const ticket = event.ticketTypes.find(t => t.id === ticketId);
    const newQuantity = Math.max(0, Math.min(quantity, ticket.qtyAvailable));

    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: newQuantity
    }));
  };

  const calculateTotal = () => {
    return event.ticketTypes.reduce((total, ticket) => {
      const quantity = selectedTickets[ticket.id] || 0;
      return total + (ticket.price * quantity);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      toast.error('Please select at least one ticket.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, this would be an API call to create the booking
      const bookingData = {
        eventId: event.id,
        tickets: event.ticketTypes
          .filter(ticket => selectedTickets[ticket.id] > 0)
          .map(ticket => ({
            ticketTypeId: ticket.id,
            quantity: selectedTickets[ticket.id],
            price: ticket.price
          })),
        total: calculateTotal()
      };

      console.log('Booking data:', bookingData);

      toast.success('Booking successful! Redirecting to your tickets...');
      setTimeout(() => {
        navigate('/my-tickets');
      }, 1500);

    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading booking page...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-message">
        <h2>Event not found</h2>
        <button onClick={() => navigate('/events')} className="btn btn-primary">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="event-booking-page">
      <div className="container">
        <button
          onClick={() => navigate(`/events/${slug}`)}
          className="back-button"
        >
          <ArrowLeft size={20} />
          Back to Event Details
        </button>

        <div className="booking-content">
          <div className="event-summary">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="event-image"
            />
            <div className="event-info">
              <h1>{event.title}</h1>
              <div className="event-meta">
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{formatDate(event.startAt)}</span>
                </div>
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{event.venueName}, {event.city}</span>
                </div>
                <div className="meta-item">
                  <Users size={16} />
                  <span>{event.capacity} capacity</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <h2>Select Tickets</h2>

            <div className="ticket-selection">
              {event.ticketTypes.map(ticket => (
                <div key={ticket.id} className="ticket-option" data-type={ticket.type}>
                  <div className="ticket-info">
                    <h3>{ticket.name}</h3>
                    <p className="ticket-price">₹{ticket.price}</p>
                    <p className="ticket-availability">
                      {ticket.qtyAvailable} of {ticket.qtyTotal} available
                    </p>
                  </div>

                  <div className="quantity-selector">
                    <button
                      type="button"
                      onClick={() => handleTicketQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) - 1)}
                      disabled={selectedTickets[ticket.id] <= 0}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-display">
                      {selectedTickets[ticket.id] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTicketQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) + 1)}
                      disabled={selectedTickets[ticket.id] >= ticket.qtyAvailable}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="booking-summary">
              <div className="summary-row">
                <span>Total Tickets:</span>
                <span>{getTotalTickets()}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isSubmitting || getTotalTickets() === 0}
            >
              {isSubmitting ? 'Processing...' : `Book ${getTotalTickets()} Ticket${getTotalTickets() !== 1 ? 's' : ''}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventBookingPage;
