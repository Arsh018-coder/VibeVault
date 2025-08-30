import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Download } from 'lucide-react';
import './MyTicketsPage.css';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for tickets
    const mockTickets = [
      {
        id: 1,
        eventTitle: 'Tech Conference 2024',
        eventDate: '2024-12-15',
        eventTime: '09:00 AM',
        location: 'Mumbai, India',
        ticketType: 'VIP',
        price: 2499,
        status: 'confirmed',
        qrCode: 'TC2024-VIP-001'
      },
      {
        id: 2,
        eventTitle: 'Bollywood Music Festival',
        eventDate: '2024-11-20',
        eventTime: '06:00 PM',
        location: 'Bangalore, India',
        ticketType: 'General Admission',
        price: 1299,
        status: 'confirmed',
        qrCode: 'BMF2024-GA-002'
      },
      {
        id: 3,
        eventTitle: 'Indian Street Food Festival',
        eventDate: '2024-11-25',
        eventTime: '12:00 PM',
        location: 'Delhi, India',
        ticketType: 'Food Pass',
        price: 499,
        status: 'confirmed',
        qrCode: 'SFF2024-FP-003'
      },
      {
        id: 4,
        eventTitle: 'Stand-up Comedy Night',
        eventDate: '2024-11-18',
        eventTime: '08:00 PM',
        location: 'Bangalore, India',
        ticketType: 'Premium',
        price: 799,
        status: 'pending',
        qrCode: 'SCN2024-PR-004'
      }
    ];

    setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="my-tickets-page">
        <div className="loading">Loading your tickets...</div>
      </div>
    );
  }

  return (
    <div className="my-tickets-page">
      <div className="tickets-header">
        <h1>My Tickets</h1>
        <p>Manage and view all your event tickets</p>
      </div>

      {tickets.length > 0 ? (
        <div className="tickets-list">
          {tickets.map(ticket => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-main">
                <div className="ticket-info">
                  <h3 className="event-title">{ticket.eventTitle}</h3>
                  
                  <div className="ticket-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{formatDate(ticket.eventDate)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{ticket.eventTime}</span>
                    </div>
                    
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{ticket.location}</span>
                    </div>
                  </div>

                  <div className="ticket-meta">
                    <span className="ticket-type">{ticket.ticketType}</span>
                    <span className="ticket-price">${ticket.price}</span>
                  </div>
                </div>

                <div className="ticket-actions">
                  <div 
                    className="ticket-status"
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </div>
                  
                  <button className="download-btn">
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>

              <div className="ticket-qr">
                <div className="qr-placeholder">
                  <div className="qr-code">QR</div>
                  <span className="qr-text">{ticket.qrCode}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-tickets">
          <h3>No tickets found</h3>
          <p>You haven't purchased any tickets yet.</p>
          <button className="browse-events-btn">Browse Events</button>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;