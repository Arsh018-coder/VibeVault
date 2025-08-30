import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, MapPin } from 'lucide-react';
import EventCard from '../../components/features/events/EventCard';
import './HomePage.css';

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock featured events data - diverse selection from different categories
    const mockEvents = [
      {
        id: 1,
        slug: 'tech-conference-2025',
        title: 'Tech Conference 2025',
        description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative technologies.',
        date: '2025-12-15',
        location: 'Mumbai, India',
        price: 1999,
        capacity: 500,
        category: 'Technology',
        imageUrl: 'https://via.placeholder.com/300x200?text=Tech+Conference',
        ticketTypes: [
          { id: 1, type: 'early-bird', name: 'Early Bird', price: 1999 },
          { id: 2, type: 'regular', name: 'Regular', price: 2499 },
          { id: 3, type: 'vip', name: 'VIP', price: 3999 }
        ]
      },
      {
        id: 2,
        slug: 'bollywood-music-festival',
        title: 'Bollywood Music Festival',
        description: 'Experience amazing live music from top Bollywood artists in a beautiful outdoor setting.',
        date: '2025-11-20',
        location: 'Bangalore, India',
        price: 999,
        capacity: 2000,
        category: 'Music',
        imageUrl: 'https://via.placeholder.com/300x200?text=Music+Festival',
        ticketTypes: [
          { id: 4, type: 'early-bird', name: 'Early Bird', price: 999 },
          { id: 5, type: 'regular', name: 'Regular', price: 1299 },
          { id: 6, type: 'vip', name: 'VIP', price: 2999 }
        ]
      },
      {
        id: 5,
        slug: 'startup-networking-summit',
        title: 'Startup Networking Summit',
        description: 'Connect with entrepreneurs, investors, and industry leaders in this exclusive networking event.',
        date: '2025-12-05',
        location: 'Pune, India',
        price: 1499,
        capacity: 300,
        category: 'Business',
        imageUrl: 'https://via.placeholder.com/300x200?text=Business+Summit',
        ticketTypes: [
          { id: 10, type: 'early-bird', name: 'Early Bird', price: 1499 },
          { id: 11, type: 'regular', name: 'Startup Pass', price: 1999 },
          { id: 12, type: 'vip', name: 'Investor Pass', price: 4999 }
        ]
      },
      {
        id: 6,
        slug: 'indian-street-food-festival',
        title: 'Indian Street Food Festival',
        description: 'Taste authentic street food from across India in this amazing culinary celebration.',
        date: '2025-11-25',
        location: 'Delhi, India',
        price: 399,
        capacity: 1000,
        category: 'Food & Drink',
        imageUrl: 'https://via.placeholder.com/300x200?text=Food+Festival',
        ticketTypes: [
          { id: 130, type: 'early-bird', name: 'Early Bird', price: 399 },
          { id: 13, type: 'regular', name: 'Food Pass', price: 499 },
          { id: 14, type: 'vip', name: 'Premium Tasting', price: 999 }
        ]
      },
      {
        id: 8,
        slug: 'stand-up-comedy-night',
        title: 'Stand-up Comedy Night',
        description: 'Laugh out loud with India\'s top comedians in this hilarious comedy show.',
        date: '2025-11-18',
        location: 'Bangalore, India',
        price: 599,
        capacity: 400,
        category: 'Entertainment',
        imageUrl: 'https://via.placeholder.com/300x200?text=Comedy+Show',
        ticketTypes: [
          { id: 170, type: 'early-bird', name: 'Early Bird', price: 599 },
          { id: 17, type: 'regular', name: 'Regular', price: 799 },
          { id: 18, type: 'vip', name: 'Front Row VIP', price: 1299 }
        ]
      },
      {
        id: 4,
        slug: 'ipl-cricket-match',
        title: 'IPL Cricket Match',
        description: 'Watch the thrilling IPL match between Mumbai Indians and Chennai Super Kings.',
        date: '2025-11-15',
        location: 'Mumbai, India',
        price: 699,
        capacity: 50000,
        category: 'Sports',
        imageUrl: 'https://via.placeholder.com/300x200?text=Cricket+Match',
        ticketTypes: [
          { id: 80, type: 'early-bird', name: 'Early Bird', price: 699 },
          { id: 8, type: 'regular', name: 'General Stand', price: 899 },
          { id: 9, type: 'vip', name: 'Premium Box', price: 2499 }
        ]
      }
    ];

    setTimeout(() => {
      setFeaturedEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">Loading featured events...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover Amazing Events</h1>
          <p>Find and book tickets for the best events happening around you</p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary">
              Browse Events
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <Calendar size={24} />
            <div>
              <span className="stat-number">10+</span>
              <span className="stat-label">Events</span>
            </div>
          </div>
          <div className="stat">
            <Users size={24} />
            <div>
              <span className="stat-number">1K+</span>
              <span className="stat-label">Attendees</span>
            </div>
          </div>
          <div className="stat">
            <MapPin size={24} />
            <div>
              <span className="stat-number">8+</span>
              <span className="stat-label">Cities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="featured-events-section">
        <div className="section-header">
          <h2>Featured Events</h2>
          <Link to="/events" className="view-all-link">
            View All Events
            <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="events-grid">
          {featuredEvents.length > 0 ? (
            featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="no-events">
              <p>No featured events available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
