import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Calendar, Users, DollarSign, 
  MapPin, Clock, AlertCircle, Ticket, BarChart2, 
  TrendingUp, UserCheck, Loader2, ExternalLink 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
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
        const response = await api.get('/events/organizer/dashboard');
        
        // Ensure response data exists and has expected structure
        if (!response.data) {
          throw new Error('No data received from server');
        }
        
        const { stats: dashboardStats = {}, recentEvents = [] } = response.data;
        
        // Set stats with defaults in case any are undefined
        setStats({
          totalEvents: dashboardStats.totalEvents || 0,
          upcomingEvents: dashboardStats.upcomingEvents || 0,
          ticketsSold: dashboardStats.ticketsSold || 0,
          totalRevenue: dashboardStats.totalRevenue || 0
        });
        
        // Format events for the UI with null checks
        const formattedEvents = (recentEvents || []).map(event => {
          // Safely calculate tickets sold and revenue for the event
          const eventData = (event.ticketTypes || []).reduce((acc, type) => {
            const ticketsSold = type?._count?.tickets || 0;
            const price = parseFloat(type?.price) || 0;
            return {
              ticketsSold: (acc.ticketsSold || 0) + ticketsSold,
              revenue: (acc.revenue || 0) + (ticketsSold * price)
            };
          }, { ticketsSold: 0, revenue: 0 });
          
          return {
            id: event.id,
            title: event.title,
            date: event.startAt,
            endDate: event.endAt,
            location: event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Online',
            ticketsSold: eventData.ticketsSold,
            revenue: eventData.revenue,
            status: event.status?.toLowerCase() || 'draft',
            imageUrl: event.imageUrl,
            ticketTypes: event.ticketTypes
          };
        });
        
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
        await api.delete(`/events/${eventId}`);
        
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
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.firstName || 'Organizer'}! Here's what's happening with your events.</p>
          </div>
          <div className="mt-4 md:mt-0 space-x-3">
            <Link
              to="/organizer/events/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
            <Link
              to="/organizer/events"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View All Events
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Events */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalEvents}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.upcomingEvents}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Sold */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tickets Sold</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.ticketsSold}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Events</h3>
            <p className="mt-1 text-sm text-gray-500">Your recently created and upcoming events</p>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-b-lg">
            {events.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {events.map((event) => (
                  <li key={event.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-primary truncate">{event.title}</p>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              event.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {format(new Date(event.date), 'MMM d, yyyy')}
                                <span className="mx-1">•</span>
                                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {format(new Date(event.date), 'h:mm a')}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {event.location}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <Ticket className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {event.ticketsSold} tickets sold
                              <span className="mx-1">•</span>
                              <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              ${event.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          <button
                            onClick={() => handleViewEvent(event.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditEvent(event.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new event.
                </p>
                <div className="mt-6">
                  <Link
                    to="/organizer/events/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Event
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-gray-500">Quickly access common tasks</p>
          </div>
          <div className="bg-white p-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/organizer/events/new"
              className="relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-gray-200 hover:border-primary transition-colors duration-150"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-100 text-blue-700 ring-4 ring-white">
                  <Plus className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Create New Event
                </h3>
                <p className="mt-1 text-sm text-gray-500">Set up a new event and start selling tickets</p>
              </div>
            </Link>

            <Link
              to="/organizer/events"
              className="relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-gray-200 hover:border-primary transition-colors duration-150"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-100 text-green-700 ring-4 ring-white">
                  <Calendar className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Events
                </h3>
                <p className="mt-1 text-sm text-gray-500">View and manage all your events in one place</p>
              </div>
            </Link>

            <Link
              to="/organizer/attendees"
              className="relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-gray-200 hover:border-primary transition-colors duration-150"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-100 text-purple-700 ring-4 ring-white">
                  <UserCheck className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Attendees
                </h3>
                <p className="mt-1 text-sm text-gray-500">See who's attending your events</p>
              </div>
            </Link>

            <Link
              to="/organizer/analytics"
              className="relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary rounded-lg border border-gray-200 hover:border-primary transition-colors duration-150"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-100 text-yellow-700 ring-4 ring-white">
                  <BarChart2 className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Analytics
                </h3>
                <p className="mt-1 text-sm text-gray-500">Track your event performance</p>
              </div>
            </Link>
          </div>
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
