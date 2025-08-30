import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import EventCard from '../../components/features/events/EventCard';
import './EventsPage.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data for now
  useEffect(() => {
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
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ['all', 'Technology', 'Music', 'Art', 'Sports', 'Business'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="events-page">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Discover Events</h1>
        <p>Find amazing events happening near you</p>
      </div>

      <div className="events-filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <Filter size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="no-events">
            <p>No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;