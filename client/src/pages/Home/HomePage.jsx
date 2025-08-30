import React, { useEffect, useState } from 'react';
import EventCard from '../../components/features/events/EventCard';
import api from '../../services/api';
import './HomePage.css';

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await api.get('/events?featured=true&limit=8');
        setFeaturedEvents(response.data.events || []);
      } catch (error) {
        console.error('Failed to fetch featured events', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedEvents();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container home-page">
      <section className="featured-events-section">
        <h2>Featured Events</h2>
        <div className="events-grid">
          {featuredEvents.length ? (
            featuredEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))
          ) : (
            <p>No featured events available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
