import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import './EventManagement.css';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/mine');
        setEvents(response.data.events);
      } catch (error) {
        console.error('Failed to fetch events', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="event-management">
      <header className="event-management-header">
        <h2>My Events</h2>
        <Link to="/events/create" className="btn btn-primary">Create Event</Link>
      </header>

      {loading ? (
        <div>Loading...</div>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <table className="event-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Tickets Sold</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id}>
                <td>{event.title}</td>
                <td>{new Date(event.dateTime.start).toLocaleDateString()}</td>
                <td>{event.stats?.bookings || 0}</td>
                <td>{event.status}</td>
                <td>
                  <Link to={`/events/${event.slug}/edit`} className="btn btn-secondary btn-sm">
                    Edit
                  </Link>
                  <Link to={`/events/${event.slug}`} className="btn btn-secondary btn-sm" style={{ marginLeft: '8px' }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EventManagement;
