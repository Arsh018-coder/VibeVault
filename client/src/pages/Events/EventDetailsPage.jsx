import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
            images: [{ url: 'https://via.placeholder.com/800x400?text=Tech+Conference+2025', alt: 'Tech Conference' }],
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
          },
          {
            id: 3,
            slug: 'contemporary-art-gallery-opening',
            title: 'Contemporary Art Gallery Opening',
            description: 'Discover contemporary art from emerging Indian artists in our new gallery space. This exclusive opening features works from 25 talented artists showcasing diverse mediums including paintings, sculptures, and digital art.',
            dateTime: { start: '2025-10-30T17:00:00Z' },
            location: { type: 'physical', venue: { name: 'National Gallery of Modern Art' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Art+Gallery', alt: 'Art Gallery' }],
            tickets: [
              { _id: 70, type: 'early-bird', name: 'Early Bird Free', price: 0, quantity: { available: 30, total: 30 }, saleWindow: { start: '2025-09-01', end: '2025-10-29' } },
              { _id: 7, type: 'regular', name: 'Regular Entry', price: 0, quantity: { available: 50, total: 50 }, saleWindow: { start: '2025-09-01', end: '2025-10-29' } },
              { _id: 71, type: 'vip', name: 'VIP Opening Reception', price: 499, quantity: { available: 20, total: 20 }, saleWindow: { start: '2025-09-01', end: '2025-10-29' } }
            ]
          },
          {
            id: 4,
            slug: 'ipl-cricket-match',
            title: 'IPL Cricket Match',
            description: 'Watch the thrilling IPL match between Mumbai Indians and Chennai Super Kings. Experience the excitement of live cricket with thousands of passionate fans in the iconic Wankhede Stadium.',
            dateTime: { start: '2025-11-15T19:30:00Z' },
            location: { type: 'physical', venue: { name: 'Wankhede Stadium' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Cricket+Match', alt: 'Cricket Match' }],
            tickets: [
              { _id: 80, type: 'early-bird', name: 'Early Bird', price: 699, quantity: { available: 5000, total: 7000 }, saleWindow: { start: '2025-09-01', end: '2025-11-14' } },
              { _id: 8, type: 'regular', name: 'General Stand', price: 899, quantity: { available: 25000, total: 28000 }, saleWindow: { start: '2025-09-01', end: '2025-11-14' } },
              { _id: 9, type: 'vip', name: 'Premium Box', price: 2499, quantity: { available: 5000, total: 8000 }, saleWindow: { start: '2025-09-01', end: '2025-11-14' } }
            ]
          },
          {
            id: 5,
            slug: 'startup-networking-summit',
            title: 'Startup Networking Summit',
            description: 'Connect with entrepreneurs, investors, and industry leaders in this exclusive networking event. Features keynote speakers, panel discussions, and networking sessions designed to foster innovation and collaboration.',
            dateTime: { start: '2025-12-05T10:00:00Z' },
            location: { type: 'physical', venue: { name: 'Pune IT Park' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Business+Summit', alt: 'Business Summit' }],
            tickets: [
              { _id: 10, type: 'early-bird', name: 'Early Bird', price: 1499, quantity: { available: 50, total: 75 }, saleWindow: { start: '2025-09-01', end: '2025-11-01' } },
              { _id: 11, type: 'regular', name: 'Startup Pass', price: 1999, quantity: { available: 200, total: 250 }, saleWindow: { start: '2025-09-01', end: '2025-12-04' } },
              { _id: 12, type: 'vip', name: 'Investor Pass', price: 4999, quantity: { available: 40, total: 50 }, saleWindow: { start: '2025-09-01', end: '2025-12-04' } }
            ]
          },
          {
            id: 6,
            slug: 'indian-street-food-festival',
            title: 'Indian Street Food Festival',
            description: 'Taste authentic street food from across India in this amazing culinary celebration. Over 50 food stalls featuring regional specialties from Mumbai, Delhi, Kolkata, Chennai, and more.',
            dateTime: { start: '2025-11-25T12:00:00Z' },
            location: { type: 'physical', venue: { name: 'Connaught Place' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Food+Festival', alt: 'Food Festival' }],
            tickets: [
              { _id: 130, type: 'early-bird', name: 'Early Bird', price: 399, quantity: { available: 200, total: 250 }, saleWindow: { start: '2025-10-01', end: '2025-11-24' } },
              { _id: 13, type: 'regular', name: 'Food Pass', price: 499, quantity: { available: 600, total: 750 }, saleWindow: { start: '2025-10-01', end: '2025-11-24' } },
              { _id: 14, type: 'vip', name: 'Premium Tasting', price: 999, quantity: { available: 150, total: 200 }, saleWindow: { start: '2025-10-01', end: '2025-11-24' } }
            ]
          },
          {
            id: 7,
            slug: 'digital-marketing-workshop',
            title: 'Digital Marketing Workshop',
            description: 'Learn the latest digital marketing strategies and tools from industry experts. Covers SEO, social media marketing, content strategy, and analytics. Includes hands-on exercises and certification.',
            dateTime: { start: '2025-12-10T14:00:00Z' },
            location: { type: 'physical', venue: { name: 'HITEC City Convention Center' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Workshop', alt: 'Workshop' }],
            tickets: [
              { _id: 15, type: 'early-bird', name: 'Early Bird', price: 1199, quantity: { available: 30, total: 50 }, saleWindow: { start: '2025-10-01', end: '2025-11-15' } },
              { _id: 16, type: 'regular', name: 'Workshop Pass', price: 1499, quantity: { available: 80, total: 100 }, saleWindow: { start: '2025-10-01', end: '2025-12-09' } },
              { _id: 16.1, type: 'vip', name: 'VIP Masterclass', price: 2499, quantity: { available: 20, total: 25 }, saleWindow: { start: '2025-10-01', end: '2025-12-09' } }
            ]
          },
          {
            id: 8,
            slug: 'stand-up-comedy-night',
            title: 'Stand-up Comedy Night',
            description: 'Laugh out loud with India\'s top comedians in this hilarious comedy show. Featuring performances by renowned stand-up artists with their latest material and special guest appearances.',
            dateTime: { start: '2025-11-18T20:00:00Z' },
            location: { type: 'physical', venue: { name: 'Comedy Club Bangalore' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Comedy+Show', alt: 'Comedy Show' }],
            tickets: [
              { _id: 170, type: 'early-bird', name: 'Early Bird', price: 599, quantity: { available: 50, total: 75 }, saleWindow: { start: '2025-10-01', end: '2025-11-17' } },
              { _id: 17, type: 'regular', name: 'Regular', price: 799, quantity: { available: 275, total: 325 }, saleWindow: { start: '2025-10-01', end: '2025-11-17' } },
              { _id: 18, type: 'vip', name: 'Front Row VIP', price: 1299, quantity: { available: 40, total: 50 }, saleWindow: { start: '2025-10-01', end: '2025-11-17' } }
            ]
          },
          {
            id: 9,
            slug: 'ai-machine-learning-conference',
            title: 'AI & Machine Learning Conference',
            description: 'Explore the future of AI and ML with leading researchers and practitioners. Features keynotes, technical sessions, workshops, and networking opportunities with industry experts.',
            dateTime: { start: '2025-12-20T09:00:00Z' },
            location: { type: 'physical', venue: { name: 'Chennai Trade Center' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=AI+Conference', alt: 'AI Conference' }],
            tickets: [
              { _id: 19, type: 'early-bird', name: 'Early Bird', price: 2499, quantity: { available: 100, total: 150 }, saleWindow: { start: '2025-09-01', end: '2025-11-01' } },
              { _id: 20, type: 'regular', name: 'Professional', price: 2999, quantity: { available: 400, total: 500 }, saleWindow: { start: '2025-09-01', end: '2025-12-19' } },
              { _id: 21, type: 'vip', name: 'Corporate', price: 4999, quantity: { available: 80, total: 100 }, saleWindow: { start: '2025-09-01', end: '2025-12-19' } }
            ]
          },
          {
            id: 10,
            slug: 'classical-music-concert',
            title: 'Classical Music Concert',
            description: 'Experience the beauty of Indian classical music with renowned maestros. An evening of soulful ragas and traditional compositions performed by celebrated artists.',
            dateTime: { start: '2025-11-12T19:00:00Z' },
            location: { type: 'physical', venue: { name: 'Rabindra Sadan' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Classical+Music', alt: 'Classical Music' }],
            tickets: [
              { _id: 220, type: 'early-bird', name: 'Early Bird', price: 799, quantity: { available: 100, total: 150 }, saleWindow: { start: '2025-09-01', end: '2025-11-11' } },
              { _id: 22, type: 'regular', name: 'Balcony', price: 999, quantity: { available: 350, total: 400 }, saleWindow: { start: '2025-09-01', end: '2025-11-11' } },
              { _id: 23, type: 'vip', name: 'Orchestra VIP', price: 1999, quantity: { available: 200, total: 250 }, saleWindow: { start: '2025-09-01', end: '2025-11-11' } }
            ]
          },
          {
            id: 11,
            slug: 'photography-exhibition',
            title: 'Photography Exhibition',
            description: 'Stunning photography showcasing the diversity and beauty of India. Features works from award-winning photographers capturing landscapes, culture, and street life across the subcontinent.',
            dateTime: { start: '2025-11-08T11:00:00Z' },
            location: { type: 'physical', venue: { name: 'Jawahar Kala Kendra' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Photography', alt: 'Photography' }],
            tickets: [
              { _id: 240, type: 'early-bird', name: 'Early Bird', price: 199, quantity: { available: 50, total: 70 }, saleWindow: { start: '2025-10-01', end: '2025-11-07' } },
              { _id: 24, type: 'regular', name: 'General Entry', price: 299, quantity: { available: 120, total: 130 }, saleWindow: { start: '2025-10-01', end: '2025-11-07' } },
              { _id: 241, type: 'vip', name: 'VIP Private Tour', price: 799, quantity: { available: 25, total: 30 }, saleWindow: { start: '2025-10-01', end: '2025-11-07' } }
            ]
          },
          {
            id: 12,
            slug: 'marathon-run-for-charity',
            title: 'Marathon Run for Charity',
            description: 'Join thousands of runners in this charity marathon supporting education for underprivileged children. Multiple distance options available with medals and certificates for all finishers.',
            dateTime: { start: '2025-12-01T06:00:00Z' },
            location: { type: 'physical', venue: { name: 'Marine Drive' } },
            images: [{ url: 'https://via.placeholder.com/800x400?text=Marathon', alt: 'Marathon' }],
            tickets: [
              { _id: 25, type: 'early-bird', name: 'Early Bird 5K', price: 499, quantity: { available: 1000, total: 1500 }, saleWindow: { start: '2025-09-01', end: '2025-10-31' } },
              { _id: 26, type: 'regular', name: '5K Run', price: 599, quantity: { available: 2000, total: 2500 }, saleWindow: { start: '2025-09-01', end: '2025-11-30' } },
              { _id: 27, type: 'regular', name: '10K Run', price: 899, quantity: { available: 1200, total: 1500 }, saleWindow: { start: '2025-09-01', end: '2025-11-30' } },
              { _id: 28, type: 'vip', name: 'Full Marathon', price: 1299, quantity: { available: 800, total: 1000 }, saleWindow: { start: '2025-09-01', end: '2025-11-30' } }
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
