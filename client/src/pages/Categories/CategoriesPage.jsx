import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock categories data
    const mockCategories = [
      {
        id: 1,
        name: 'Technology',
        description: 'Tech conferences, workshops, and networking events',
        eventCount: 2,
        imageUrl: 'https://via.placeholder.com/400x250?text=Technology',
        color: '#194759'
      },
      {
        id: 2,
        name: 'Music',
        description: 'Concerts, festivals, and live music performances',
        eventCount: 2,
        imageUrl: 'https://via.placeholder.com/400x250?text=Music',
        color: '#4f7369'
      },
      {
        id: 3,
        name: 'Art',
        description: 'Gallery openings, exhibitions, and art workshops',
        eventCount: 2,
        imageUrl: 'https://via.placeholder.com/400x250?text=Art',
        color: '#7ebfb3'
      },
      {
        id: 4,
        name: 'Sports',
        description: 'Sporting events, tournaments, and fitness activities',
        eventCount: 2,
        imageUrl: 'https://via.placeholder.com/400x250?text=Sports',
        color: '#194759'
      },
      {
        id: 5,
        name: 'Business',
        description: 'Professional networking, seminars, and conferences',
        eventCount: 1,
        imageUrl: 'https://via.placeholder.com/400x250?text=Business',
        color: '#4f7369'
      },
      {
        id: 6,
        name: 'Food & Drink',
        description: 'Culinary events, tastings, and food festivals',
        eventCount: 1,
        imageUrl: 'https://via.placeholder.com/400x250?text=Food',
        color: '#7ebfb3'
      },
      {
        id: 7,
        name: 'Education',
        description: 'Workshops, courses, and educational seminars',
        eventCount: 1,
        imageUrl: 'https://via.placeholder.com/400x250?text=Education',
        color: '#194759'
      },
      {
        id: 8,
        name: 'Entertainment',
        description: 'Comedy shows, theater, and entertainment events',
        eventCount: 1,
        imageUrl: 'https://via.placeholder.com/400x250?text=Entertainment',
        color: '#4f7369'
      }
    ];

    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="categories-page">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Event Categories</h1>
        <p>Discover events by category and find what interests you most</p>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <Link 
            key={category.id} 
            to={`/events?category=${category.name.toLowerCase()}`}
            className="category-card"
            style={{ '--category-color': category.color }}
          >
            <div className="category-image">
              <img 
                src={category.imageUrl} 
                alt={category.name}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400x250?text=${category.name}`;
                }}
              />
              <div className="category-overlay"></div>
            </div>
            
            <div className="category-content">
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
              
              <div className="category-stats">
                <div className="stat-item">
                  <Calendar size={16} />
                  <span>{category.eventCount} events</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>Popular</span>
                </div>
              </div>
              
              <div className="category-action">
                <span>Explore Events</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="categories-cta">
        <h2>Can't find what you're looking for?</h2>
        <p>Browse all events or create your own event</p>
        <div className="cta-buttons">
          <Link to="/events" className="btn btn-primary">
            Browse All Events
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Create Event
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;