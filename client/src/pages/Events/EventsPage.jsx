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
        location: 'Mumbai, India',
        price: 2499,
        capacity: 500,
        category: 'Technology',
        imageUrl: 'https://via.placeholder.com/300x200?text=Tech+Conference'
      },
      {
        id: 2,
        title: 'Bollywood Music Festival',
        description: 'Experience amazing live music from top Bollywood artists in a beautiful outdoor setting.',
        date: '2024-11-20',
        location: 'Bangalore, India',
        price: 1299,
        capacity: 2000,
        category: 'Music',
        imageUrl: 'https://via.placeholder.com/300x200?text=Music+Festival'
      },
      {
        id: 3,
        title: 'Contemporary Art Gallery Opening',
        description: 'Discover contemporary art from emerging Indian artists in our new gallery space.',
        date: '2024-10-30',
        location: 'Delhi, India',
        price: 0,
        capacity: 100,
        category: 'Art',
        imageUrl: 'https://via.placeholder.com/300x200?text=Art+Gallery'
      },
      {
        id: 4,
        title: 'IPL Cricket Match',
        description: 'Watch the thrilling IPL match between Mumbai Indians and Chennai Super Kings.',
        date: '2024-11-15',
        location: 'Mumbai, India',
        price: 899,
        capacity: 50000,
        category: 'Sports',
        imageUrl: 'https://via.placeholder.com/300x200?text=Cricket+Match'
      },
      {
        id: 5,
        title: 'Startup Networking Summit',
        description: 'Connect with entrepreneurs, investors, and industry leaders in this exclusive networking event.',
        date: '2024-12-05',
        location: 'Pune, India',
        price: 1999,
        capacity: 300,
        category: 'Business',
        imageUrl: 'https://via.placeholder.com/300x200?text=Business+Summit'
      },
      {
        id: 6,
        title: 'Indian Street Food Festival',
        description: 'Taste authentic street food from across India in this amazing culinary celebration.',
        date: '2024-11-25',
        location: 'Delhi, India',
        price: 499,
        capacity: 1000,
        category: 'Food & Drink',
        imageUrl: 'https://via.placeholder.com/300x200?text=Food+Festival'
      },
      {
        id: 7,
        title: 'Digital Marketing Workshop',
        description: 'Learn the latest digital marketing strategies and tools from industry experts.',
        date: '2024-12-10',
        location: 'Hyderabad, India',
        price: 1499,
        capacity: 150,
        category: 'Education',
        imageUrl: 'https://via.placeholder.com/300x200?text=Workshop'
      },
      {
        id: 8,
        title: 'Stand-up Comedy Night',
        description: 'Laugh out loud with India\'s top comedians in this hilarious comedy show.',
        date: '2024-11-18',
        location: 'Bangalore, India',
        price: 799,
        capacity: 400,
        category: 'Entertainment',
        imageUrl: 'https://via.placeholder.com/300x200?text=Comedy+Show'
      },
      {
        id: 9,
        title: 'AI & Machine Learning Conference',
        description: 'Explore the future of AI and ML with leading researchers and practitioners.',
        date: '2024-12-20',
        location: 'Chennai, India',
        price: 2999,
        capacity: 600,
        category: 'Technology',
        imageUrl: 'https://via.placeholder.com/300x200?text=AI+Conference'
      },
      {
        id: 10,
        title: 'Classical Music Concert',
        description: 'Experience the beauty of Indian classical music with renowned maestros.',
        date: '2024-11-12',
        location: 'Kolkata, India',
        price: 999,
        capacity: 800,
        category: 'Music',
        imageUrl: 'https://via.placeholder.com/300x200?text=Classical+Music'
      },
      {
        id: 11,
        title: 'Photography Exhibition',
        description: 'Stunning photography showcasing the diversity and beauty of India.',
        date: '2024-11-08',
        location: 'Jaipur, India',
        price: 299,
        capacity: 200,
        category: 'Art',
        imageUrl: 'https://via.placeholder.com/300x200?text=Photography'
      },
      {
        id: 12,
        title: 'Marathon Run for Charity',
        description: 'Join thousands of runners in this charity marathon supporting education for underprivileged children.',
        date: '2024-12-01',
        location: 'Mumbai, India',
        price: 599,
        capacity: 5000,
        category: 'Sports',
        imageUrl: 'https://via.placeholder.com/300x200?text=Marathon'
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ['all', 'Technology', 'Music', 'Art', 'Sports', 'Business', 'Food & Drink', 'Education', 'Entertainment'];

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