import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Ticket, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './MyTicketsPage.css';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/tickets/my-tickets', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTickets(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(
          err.response?.data?.message || 
          'Failed to load tickets. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTickets();
    } else {
      navigate('/login', { state: { from: '/my-tickets' } });
    }
  }, [user, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">My Tickets</h1>
        
        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Tickets Found</h2>
            <p className="text-gray-500 mb-6">You haven't purchased any tickets yet.</p>
            <button
              onClick={() => navigate('/events')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{ticket.event.title}</h3>
                          <p className="text-gray-600 mt-1">{ticket.event.organizer?.name || 'Unknown Organizer'}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ticket.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {ticket.status.charAt(0) + ticket.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(ticket.event.startTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatTime(ticket.event.startTime)} - {formatTime(ticket.event.endTime)}</span>
                        </div>
                        {ticket.event.venue && (
                          <div className="flex items-start text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{ticket.event.venue.name}, {ticket.event.venue.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-center min-w-[140px] border border-gray-200">
                      <p className="text-xs text-gray-500">Ticket #{ticket.id.slice(0, 8)}</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        {ticket.ticketType?.name || 'General Admission'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {ticket.quantity} {ticket.quantity === 1 ? 'Ticket' : 'Tickets'}
                      </p>
                      {ticket.payment && (
                        <p className="text-sm font-medium mt-1">
                          ${(ticket.payment.amount / 100).toFixed(2)}
                        </p>
                      )}
                      <button
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="mt-3 text-sm text-primary hover:text-primary-dark font-medium hover:underline transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;