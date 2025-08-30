import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import EventCard from '../../components/features/events/EventCard';
import './EventsPage.css';

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Get category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // Capitalize first letter to match our category format
      const formattedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      setSelectedCategory(formattedCategory);
    }
  }, [searchParams]);

  // Mock data for now
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        slug: 'tech-conference-2025',
        title: 'Tech Conference 2025',
        description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative technologies.',
        date: '2025-12-15',
        startAt: '2025-12-15T09:00:00Z',
        location: 'Mumbai, India',
        venueName: 'Mumbai Convention Center',
        city: 'Mumbai',
        price: 2499,
        capacity: 500,
        category: { name: 'Technology' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Tech+Conference',
        ticketTypes: [
          { id: 1, name: 'Early Bird', price: 1999 },
          { id: 2, name: 'Regular', price: 2499 }
        ]
      },
      {
        id: 2,
        slug: 'bollywood-music-festival',
        title: 'Bollywood Music Festival',
        description: 'Experience amazing live music from top Bollywood artists in a beautiful outdoor setting.',
        date: '2025-11-20',
        startAt: '2025-11-20T18:00:00Z',
        location: 'Bangalore, India',
        venueName: 'Palace Grounds',
        city: 'Bangalore',
        price: 1299,
        capacity: 2000,
        category: { name: 'Music' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Music+Festival',
        ticketTypes: [
          { id: 3, name: 'General', price: 1299 },
          { id: 4, name: 'VIP', price: 2999 }
        ]
      },
      {
        id: 3,
        slug: 'contemporary-art-gallery-opening',
        title: 'Contemporary Art Gallery Opening',
        description: 'Discover contemporary art from emerging Indian artists in our new gallery space.',
        date: '2025-10-30',
        startAt: '2025-10-30T17:00:00Z',
        location: 'Delhi, India',
        venueName: 'National Gallery of Modern Art',
        city: 'Delhi',
        price: 0,
        capacity: 100,
        category: { name: 'Art' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Art+Gallery',
        ticketTypes: [
          { id: 5, name: 'Free Entry', price: 0 }
        ]
      },
      {
        id: 4,
        slug: 'ipl-cricket-match',
        title: 'IPL Cricket Match',
        description: 'Watch the thrilling IPL match between Mumbai Indians and Chennai Super Kings.',
        date: '2025-11-15',
        startAt: '2025-11-15T19:30:00Z',
        location: 'Mumbai, India',
        venueName: 'Wankhede Stadium',
        city: 'Mumbai',
        price: 899,
        capacity: 50000,
        category: { name: 'Sports' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Cricket+Match',
        ticketTypes: [
          { id: 6, name: 'General Stand', price: 899 },
          { id: 7, name: 'Premium', price: 2499 },
          { id: 8, name: 'Corporate Box', price: 9999 }
        ]
      },
      {
        id: 5,
        slug: 'startup-networking-summit',
        title: 'Startup Networking Summit',
        description: 'Connect with entrepreneurs, investors, and industry leaders in this exclusive networking event.',
        date: '2025-12-05',
        startAt: '2025-12-05T10:00:00Z',
        location: 'Pune, India',
        venueName: 'Pune IT Park',
        city: 'Pune',
        price: 1999,
        capacity: 300,
        category: { name: 'Business' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Business+Summit',
        ticketTypes: [
          { id: 9, name: 'Startup Pass', price: 1999 },
          { id: 10, name: 'Investor Pass', price: 4999 }
        ]
      },
      {
        id: 6,
        slug: 'indian-street-food-festival',
        title: 'Indian Street Food Festival',
        description: 'Taste authentic street food from across India in this amazing culinary celebration.',
        date: '2025-11-25',
        startAt: '2025-11-25T12:00:00Z',
        location: 'Delhi, India',
        venueName: 'Connaught Place',
        city: 'Delhi',
        price: 499,
        capacity: 1000,
        category: { name: 'Food & Drink' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Food+Festival',
        ticketTypes: [
          { id: 11, name: 'Food Pass', price: 499 },
          { id: 12, name: 'Premium Tasting', price: 999 }
        ]
      },
      {
        id: 7,
        slug: 'digital-marketing-workshop',
        title: 'Digital Marketing Workshop',
        description: 'Learn the latest digital marketing strategies and tools from industry experts.',
        date: '2025-12-10',
        startAt: '2025-12-10T14:00:00Z',
        location: 'Hyderabad, India',
        venueName: 'HITEC City Convention Center',
        city: 'Hyderabad',
        price: 1499,
        capacity: 150,
        category: { name: 'Education' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Workshop',
        ticketTypes: [
          { id: 13, name: 'Workshop Pass', price: 1499 }
        ]
      },
      {
        id: 8,
        slug: 'stand-up-comedy-night',
        title: 'Stand-up Comedy Night',
        description: 'Laugh out loud with India\'s top comedians in this hilarious comedy show.',
        date: '2025-11-18',
        startAt: '2025-11-18T20:00:00Z',
        location: 'Bangalore, India',
        venueName: 'Comedy Club Bangalore',
        city: 'Bangalore',
        price: 799,
        capacity: 400,
        category: { name: 'Entertainment' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Comedy+Show',
        ticketTypes: [
          { id: 14, name: 'Regular', price: 799 },
          { id: 15, name: 'Front Row', price: 1299 }
        ]
      },
      {
        id: 9,
        slug: 'ai-machine-learning-conference',
        title: 'AI & Machine Learning Conference',
        description: 'Explore the future of AI and ML with leading researchers and practitioners.',
        date: '2025-12-20',
        startAt: '2025-12-20T09:00:00Z',
        location: 'Chennai, India',
        venueName: 'Chennai Trade Center',
        city: 'Chennai',
        price: 2999,
        capacity: 600,
        category: { name: 'Technology' },
        imageUrl: 'https://via.placeholder.com/300x200?text=AI+Conference',
        ticketTypes: [
          { id: 16, name: 'Student', price: 1999 },
          { id: 17, name: 'Professional', price: 2999 },
          { id: 18, name: 'Corporate', price: 4999 }
        ]
      },
      {
        id: 10,
        slug: 'classical-music-concert',
        title: 'Classical Music Concert',
        description: 'Experience the beauty of Indian classical music with renowned maestros.',
        date: '2025-11-12',
        startAt: '2025-11-12T19:00:00Z',
        location: 'Kolkata, India',
        venueName: 'Rabindra Sadan',
        city: 'Kolkata',
        price: 999,
        capacity: 800,
        category: { name: 'Music' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Classical+Music',
        ticketTypes: [
          { id: 19, name: 'Balcony', price: 999 },
          { id: 20, name: 'Orchestra', price: 1999 }
        ]
      },
      {
        id: 11,
        slug: 'photography-exhibition',
        title: 'Photography Exhibition',
        description: 'Stunning photography showcasing the diversity and beauty of India.',
        date: '2025-11-08',
        startAt: '2025-11-08T11:00:00Z',
        location: 'Jaipur, India',
        venueName: 'Jawahar Kala Kendra',
        city: 'Jaipur',
        price: 299,
        capacity: 200,
        category: { name: 'Art' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Photography',
        ticketTypes: [
          { id: 21, name: 'General Entry', price: 299 }
        ]
      },
      {
        id: 12,
        slug: 'marathon-run-for-charity',
        title: 'Marathon Run for Charity',
        description: 'Join thousands of runners in this charity marathon supporting education for underprivileged children.',
        date: '2025-12-01',
        startAt: '2025-12-01T06:00:00Z',
        location: 'Mumbai, India',
        venueName: 'Marine Drive',
        city: 'Mumbai',
        price: 599,
        capacity: 5000,
        category: { name: 'Sports' },
        imageUrl: 'https://via.placeholder.com/300x200?text=Marathon',
        ticketTypes: [
          { id: 22, name: '5K Run', price: 599 },
          { id: 23, name: '10K Run', price: 899 },
          { id: 24, name: 'Full Marathon', price: 1299 }
        ]
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
    const matchesCategory = selectedCategory === 'all' || 
                           event.category?.name === selectedCategory || 
                           event.category === selectedCategory;
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
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              // Update URL params when category changes
              if (e.target.value === 'all') {
                setSearchParams({});
              } else {
                setSearchParams({ category: e.target.value.toLowerCase() });
              }
            }}
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