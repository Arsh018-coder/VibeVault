import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Calendar, Users, DollarSign, MapPin, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './OrganizerDashboard.css';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    ticketsSold: 0,
    totalRevenue: 0
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events/organizer/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const { stats: dashboardStats, recentEvents } = response.data;
        
        setStats({
          totalEvents: dashboardStats.totalEvents,
          upcomingEvents: dashboardStats.upcomingEvents,
          ticketsSold: dashboardStats.ticketsSold,
          totalRevenue: dashboardStats.totalRevenue
        });
        
        // Format events for the UI
        const formattedEvents = recentEvents.map(event => ({
          id: event.id,
          title: event.title,
          date: event.startAt,
          endDate: event.endAt,
          location: event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Online',
          ticketsSold: event.ticketTypes.reduce((total, type) => total + (type.ticketsSold || 0), 0),
          revenue: event.ticketTypes.reduce((total, type) => 
            total + (type.price * (type.ticketsSold || 0)), 0
          ),
          status: event.status?.toLowerCase() || 'draft',
          imageUrl: event.imageUrl,
          ticketTypes: event.ticketTypes
        }));
        
        setEvents(formattedEvents);
        setError(null);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(
          err.response?.data?.message || 
          'Failed to load dashboard data. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleEditEvent = (eventId) => {
    navigate(`/organizer/events/${eventId}/edit`);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Update the events list to remove the deleted event
        setEvents(events.filter(event => event.id !== eventId));
        
        // Update the stats
        setStats(prevStats => ({
          ...prevStats,
          totalEvents: prevStats.totalEvents - 1,
          upcomingEvents: events.find(e => e.id === eventId)?.status === 'active' 
            ? prevStats.upcomingEvents - 1 
            : prevStats.upcomingEvents
        }));
        
        toast.success('Event deleted successfully');
      } catch (err) {
        console.error('Error deleting event:', err);
        toast.error(err.response?.data?.message || 'Failed to delete event');
      }
    }
  };
  
  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-4xl mx-auto my-8">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your events and track your performance</p>
          </div>
          <Link
            to="/organizer/events/new"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Event
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Events</h3>
            <p className="mt-2 text-3xl font-bold text-primary">{stats.totalEvents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
            <p className="mt-2 text-3xl font-bold text-primary">{stats.upcomingEvents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Tickets Sold</h3>
            <p className="mt-2 text-3xl font-bold text-primary">{stats.ticketsSold}</p>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Events</h3>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Calendar className="w-12 h-12 mx-auto text-gray-300" />
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Your Events</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage your upcoming and past events
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('/organizer/events/new')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              <AnimatePresence>
                {events.map((event) => (
                  <motion.li
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Link to={`/events/${event.id}`} className="text-lg font-medium text-primary hover:text-primary-dark truncate">
                          {event.title}
                        </Link>
                        <div className="ml-2 flex-shrink-0 flex">
                          <Link
                            to={`/organizer/events/${event.id}/edit`}
                            className="mr-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1 rounded-full text-red-400 hover:text-red-500 focus:outline-none"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {event.ticketsSold} / {event.capacity} tickets sold
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {event.location}
                        </p>
                      </div>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.status === 'published' ? 'bg-green-100 text-green-800' :
                            event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {event.status === 'published' ? 'Published' :
                           event.status === 'draft' ? 'Draft' :
                           event.status === 'cancelled' ? 'Cancelled' :
                           'Unknown'}
                        </span>
                      </td>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
