import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, MapPin } from 'lucide-react';
import EventCard from '../../components/features/events/EventCard';
import { eventAPI } from '../../services/eventAPI';
import './HomePage.css';

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const events = await eventAPI.getFeaturedEvents();
        setFeaturedEvents(events);
      } catch (error) {
        console.error('Error fetching featured events:', error);
        // Fallback to mock data if API fails
        const mockEvents = [
          {
            id: 1,
            slug: 'tech-conference-2025',
            title: 'Tech Conference 2025',
            description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative technologies.',
            startAt: '2025-12-15T09:00:00Z',
            venueName: 'Mumbai Convention Center',
            city: 'Mumbai',
            capacity: 500,
            category: { name: 'Technology' },
            images: [{ url: 'https://via.placeholder.com/300x200?text=Tech+Conference', isPrimary: true }],
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
            startAt: '2025-11-20T18:00:00Z',
            venueName: 'Palace Grounds',
            city: 'Bangalore',
            capacity: 2000,
            category: { name: 'Music' },
            images: [{ url: 'https://via.placeholder.com/300x200?text=Music+Festival', isPrimary: true }],
            ticketTypes: [
              { id: 4, type: 'early-bird', name: 'Early Bird', price: 999 },
              { id: 5, type: 'regular', name: 'Regular', price: 1299 },
              { id: 6, type: 'vip', name: 'VIP', price: 2999 }
            ]
          }
        ];
        setFeaturedEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
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
            <Calendar className="stat-icon" />
            <div className="stat-content">
              <span className="stat-number">100+</span>
              <span className="stat-label">Events</span>
            </div>
          </div>
          <div className="stat">
            <Users className="stat-icon" />
            <div className="stat-content">
              <span className="stat-number">15K+</span>
              <span className="stat-label">Attendees</span>
            </div>
          </div>
          <div className="stat">
            <MapPin className="stat-icon" />
            <div className="stat-content">
              <span className="stat-number">80+</span>
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
