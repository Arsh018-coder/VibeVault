import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './EventBookingPage.css';

const EventBookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

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
            imageUrl: 'https://via.placeholder.com/800x400?text=Tech+Conference+2025',
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
          },
          {
            id: 3,
            slug: 'contemporary-art-gallery-opening',
            title: 'Contemporary Art Gallery Opening',
            description: 'Discover contemporary art from emerging Indian artists in our new gallery space.',
            startAt: '2025-10-30T17:00:00Z',
            endAt: '2025-10-30T21:00:00Z',
            venueName: 'National Gallery of Modern Art',
            city: 'Delhi',
            capacity: 100,
            category: { name: 'Art' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Art+Gallery',
            ticketTypes: [
              { id: 70, type: 'early-bird', name: 'Early Bird Free', price: 0, qtyAvailable: 30, qtyTotal: 30 },
              { id: 7, type: 'regular', name: 'Regular Entry', price: 0, qtyAvailable: 50, qtyTotal: 50 },
              { id: 71, type: 'vip', name: 'VIP Opening Reception', price: 499, qtyAvailable: 20, qtyTotal: 20 }
            ]
          },
          {
            id: 4,
            slug: 'ipl-cricket-match',
            title: 'IPL Cricket Match',
            description: 'Watch the thrilling IPL match between Mumbai Indians and Chennai Super Kings.',
            startAt: '2025-11-15T19:30:00Z',
            endAt: '2025-11-15T23:00:00Z',
            venueName: 'Wankhede Stadium',
            city: 'Mumbai',
            capacity: 50000,
            category: { name: 'Sports' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Cricket+Match',
            ticketTypes: [
              { id: 80, type: 'early-bird', name: 'Early Bird', price: 699, qtyAvailable: 5000, qtyTotal: 7000 },
              { id: 8, type: 'regular', name: 'General Stand', price: 899, qtyAvailable: 25000, qtyTotal: 28000 },
              { id: 9, type: 'vip', name: 'Premium Box', price: 2499, qtyAvailable: 5000, qtyTotal: 8000 }
            ]
          },
          {
            id: 5,
            slug: 'startup-networking-summit',
            title: 'Startup Networking Summit',
            description: 'Connect with entrepreneurs, investors, and industry leaders in this exclusive networking event.',
            startAt: '2025-12-05T10:00:00Z',
            endAt: '2025-12-05T18:00:00Z',
            venueName: 'Pune IT Park',
            city: 'Pune',
            capacity: 300,
            category: { name: 'Business' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Business+Summit',
            ticketTypes: [
              { id: 10, type: 'early-bird', name: 'Early Bird', price: 1499, qtyAvailable: 50, qtyTotal: 75 },
              { id: 11, type: 'regular', name: 'Startup Pass', price: 1999, qtyAvailable: 200, qtyTotal: 250 },
              { id: 12, type: 'vip', name: 'Investor Pass', price: 4999, qtyAvailable: 40, qtyTotal: 50 }
            ]
          },
          {
            id: 6,
            slug: 'indian-street-food-festival',
            title: 'Indian Street Food Festival',
            description: 'Taste authentic street food from across India in this amazing culinary celebration.',
            startAt: '2025-11-25T12:00:00Z',
            endAt: '2025-11-25T22:00:00Z',
            venueName: 'Connaught Place',
            city: 'Delhi',
            capacity: 1000,
            category: { name: 'Food & Drink' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Food+Festival',
            ticketTypes: [
              { id: 130, type: 'early-bird', name: 'Early Bird', price: 399, qtyAvailable: 200, qtyTotal: 250 },
              { id: 13, type: 'regular', name: 'Food Pass', price: 499, qtyAvailable: 600, qtyTotal: 750 },
              { id: 14, type: 'vip', name: 'Premium Tasting', price: 999, qtyAvailable: 150, qtyTotal: 200 }
            ]
          },
          {
            id: 7,
            slug: 'digital-marketing-workshop',
            title: 'Digital Marketing Workshop',
            description: 'Learn the latest digital marketing strategies and tools from industry experts.',
            startAt: '2025-12-10T14:00:00Z',
            endAt: '2025-12-10T18:00:00Z',
            venueName: 'HITEC City Convention Center',
            city: 'Hyderabad',
            capacity: 150,
            category: { name: 'Education' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Workshop',
            ticketTypes: [
              { id: 15, type: 'early-bird', name: 'Early Bird', price: 1199, qtyAvailable: 30, qtyTotal: 50 },
              { id: 16, type: 'regular', name: 'Workshop Pass', price: 1499, qtyAvailable: 80, qtyTotal: 100 },
              { id: 161, type: 'vip', name: 'VIP Masterclass', price: 2499, qtyAvailable: 20, qtyTotal: 25 }
            ]
          },
          {
            id: 8,
            slug: 'stand-up-comedy-night',
            title: 'Stand-up Comedy Night',
            description: 'Laugh out loud with India\'s top comedians in this hilarious comedy show.',
            startAt: '2025-11-18T20:00:00Z',
            endAt: '2025-11-18T22:30:00Z',
            venueName: 'Comedy Club Bangalore',
            city: 'Bangalore',
            capacity: 400,
            category: { name: 'Entertainment' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Comedy+Show',
            ticketTypes: [
              { id: 170, type: 'early-bird', name: 'Early Bird', price: 599, qtyAvailable: 50, qtyTotal: 75 },
              { id: 17, type: 'regular', name: 'Regular', price: 799, qtyAvailable: 275, qtyTotal: 325 },
              { id: 18, type: 'vip', name: 'Front Row VIP', price: 1299, qtyAvailable: 40, qtyTotal: 50 }
            ]
          },
          {
            id: 9,
            slug: 'ai-machine-learning-conference',
            title: 'AI & Machine Learning Conference',
            description: 'Explore the future of AI and ML with leading researchers and practitioners.',
            startAt: '2025-12-20T09:00:00Z',
            endAt: '2025-12-20T17:00:00Z',
            venueName: 'Chennai Trade Center',
            city: 'Chennai',
            capacity: 600,
            category: { name: 'Technology' },
            imageUrl: 'https://via.placeholder.com/800x400?text=AI+Conference',
            ticketTypes: [
              { id: 19, type: 'early-bird', name: 'Early Bird', price: 2499, qtyAvailable: 100, qtyTotal: 150 },
              { id: 20, type: 'regular', name: 'Professional', price: 2999, qtyAvailable: 400, qtyTotal: 500 },
              { id: 21, type: 'vip', name: 'Corporate', price: 4999, qtyAvailable: 80, qtyTotal: 100 }
            ]
          },
          {
            id: 10,
            slug: 'classical-music-concert',
            title: 'Classical Music Concert',
            description: 'Experience the beauty of Indian classical music with renowned maestros.',
            startAt: '2025-11-12T19:00:00Z',
            endAt: '2025-11-12T22:00:00Z',
            venueName: 'Rabindra Sadan',
            city: 'Kolkata',
            capacity: 800,
            category: { name: 'Music' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Classical+Music',
            ticketTypes: [
              { id: 220, type: 'early-bird', name: 'Early Bird', price: 799, qtyAvailable: 100, qtyTotal: 150 },
              { id: 22, type: 'regular', name: 'Balcony', price: 999, qtyAvailable: 350, qtyTotal: 400 },
              { id: 23, type: 'vip', name: 'Orchestra VIP', price: 1999, qtyAvailable: 200, qtyTotal: 250 }
            ]
          },
          {
            id: 11,
            slug: 'photography-exhibition',
            title: 'Photography Exhibition',
            description: 'Stunning photography showcasing the diversity and beauty of India.',
            startAt: '2025-11-08T11:00:00Z',
            endAt: '2025-11-08T18:00:00Z',
            venueName: 'Jawahar Kala Kendra',
            city: 'Jaipur',
            capacity: 200,
            category: { name: 'Art' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Photography',
            ticketTypes: [
              { id: 240, type: 'early-bird', name: 'Early Bird', price: 199, qtyAvailable: 50, qtyTotal: 70 },
              { id: 24, type: 'regular', name: 'General Entry', price: 299, qtyAvailable: 120, qtyTotal: 130 },
              { id: 241, type: 'vip', name: 'VIP Private Tour', price: 799, qtyAvailable: 25, qtyTotal: 30 }
            ]
          },
          {
            id: 12,
            slug: 'marathon-run-for-charity',
            title: 'Marathon Run for Charity',
            description: 'Join thousands of runners in this charity marathon supporting education for underprivileged children.',
            startAt: '2025-12-01T06:00:00Z',
            endAt: '2025-12-01T12:00:00Z',
            venueName: 'Marine Drive',
            city: 'Mumbai',
            capacity: 5000,
            category: { name: 'Sports' },
            imageUrl: 'https://via.placeholder.com/800x400?text=Marathon',
            ticketTypes: [
              { id: 25, type: 'early-bird', name: 'Early Bird 5K', price: 499, qtyAvailable: 1000, qtyTotal: 1500 },
              { id: 27, type: 'regular', name: '10K Run', price: 899, qtyAvailable: 1200, qtyTotal: 1500 },
              { id: 28, type: 'vip', name: 'Full Marathon', price: 1299, qtyAvailable: 800, qtyTotal: 1000 }
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      navigate('/login', { state: { from: `/events/${slug}/book` } });
      return;
    }
    
    const tickets = [];
    Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
      if (quantity > 0) {
        const ticketType = event.ticketTypes.find(t => t.id === parseInt(ticketTypeId));
        if (ticketType) {
          tickets.push({
            id: `${event.id}-${ticketType.id}`,
            eventId: event.id,
            eventTitle: event.title,
            eventDate: new Date(event.startAt).toLocaleDateString(),
            eventTime: new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: `${event.venueName}, ${event.city}`,
            ticketType: ticketType.name,
            price: ticketType.price,
            quantity: quantity
          });
        }
      }
    });
    
    if (tickets.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }
    
    tickets.forEach(ticket => {
      addToCart(ticket);
    });
    
    toast.success('Tickets added to cart!');
    navigate('/cart');
  };
  
  const handleBookNow = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to book tickets');
      navigate('/login', { state: { from: `/events/${slug}/book` } });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare booking data
      const bookingItems = [];
      Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
        if (quantity > 0) {
          const ticketType = event.ticketTypes.find(t => t.id === parseInt(ticketTypeId));
          if (ticketType) {
            bookingItems.push({
              ticketTypeId: ticketType.id,
              quantity: quantity,
              price: ticketType.price
            });
          }
        }
      });

      const bookingData = {
        eventId: event.id,
        items: bookingItems
      };

      // Create booking
      const response = await api.post('/bookings', bookingData);
      const booking = response.data;

      toast.success('Booking created! Redirecting to payment...');
      
      // Navigate to payment page
      navigate(`/payment/${booking.id}`);
      
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking. Please try again.');
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

          <form onSubmit={handleBookNow} className="booking-form">
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

            <div className="booking-actions">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={handleAddToCart}
                disabled={isSubmitting || !Object.values(selectedTickets).some(qty => qty > 0)}
              >
                <ShoppingCart size={18} style={{ marginRight: '8px' }} />
                Add to Cart
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting || !Object.values(selectedTickets).some(qty => qty > 0)}
              >
                {isSubmitting ? 'Processing...' : 'Book Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventBookingPage;
