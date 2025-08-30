import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, MapPin } from 'lucide-react';
import EventCard from '../../components/features/events/EventCard';
import './HomePage.css';

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock featured events data (same as EventsPage)
    const mockEvents = [
      {
        id: 1,
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative technologies.',
        date: '2024-12-15',
        location: 'San Francisco, CA',
        price: 299,
        capacity: 500,
        category: 'Technology',
        imageUrl: 'https://via.placeholder.com/300x200?text=Tech+Conference'
      },
      {
        id: 2,
        title: 'Music Festival',
        description: 'Experience amazing live music from top artists in a beautiful outdoor setting.',
        date: '2024-11-20',
        location: 'Austin, TX',
        price: 150,
        capacity: 2000,
        category: 'Music',
        imageUrl: 'https://via.placeholder.com/300x200?text=Music+Festival'
      },
      {
        id: 3,
        title: 'Art Gallery Opening',
        description: 'Discover contemporary art from emerging artists in our new gallery space.',
        date: '2024-10-30',
        location: 'New York, NY',
        price: 0,
        capacity: 100,
        category: 'Art',
        imageUrl: 'https://via.placeholder.com/300x200?text=Art+Gallery'
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
              <span className="stat-number">500+</span>
              <span className="stat-label">Events</span>
            </div>
          </div>
          <div className="stat">
            <Users size={24} />
            <div>
              <span className="stat-number">10K+</span>
              <span className="stat-label">Attendees</span>
            </div>
          </div>
          <div className="stat">
            <MapPin size={24} />
            <div>
              <span className="stat-number">50+</span>
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
