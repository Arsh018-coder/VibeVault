import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import StripeCheckout from '../../components/payment/StripeCheckout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './PaymentPage.css';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        setBooking(response.data);
        
        // Check if already paid
        if (response.data.paymentStatus === 'SUCCESS') {
          setPaymentStatus('success');
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        toast.error('Failed to load booking details');
        navigate('/dashboard/attendee');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, navigate]);

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentStatus('success');
    toast.success('Payment successful! Your tickets have been confirmed.');
    
    // Redirect to tickets page after a short delay
    setTimeout(() => {
      navigate('/my-tickets');
    }, 3000);
  };

  const handlePaymentError = (error) => {
    setPaymentStatus('failed');
    console.error('Payment failed:', error);
    toast.error('Payment failed. Please try again.');
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="error-message">
        <AlertCircle size={48} />
        <h2>Booking not found</h2>
        <p>We couldn't find the booking you're looking for.</p>
        <button onClick={() => navigate('/dashboard/attendee')} className="btn btn-primary">
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="payment-success">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h1>Payment Successful!</h1>
            <p>Your tickets have been confirmed and sent to your email.</p>
            
            <div className="booking-details">
              <h3>Booking Details</h3>
              <div className="detail-row">
                <span>Booking ID:</span>
                <span>{booking.bookingCode}</span>
              </div>
              <div className="detail-row">
                <span>Event:</span>
                <span>{booking.event?.title}</span>
              </div>
              <div className="detail-row">
                <span>Amount Paid:</span>
                <span>₹{booking.total?.toLocaleString()}</span>
              </div>
            </div>

            <div className="success-actions">
              <button 
                onClick={() => navigate('/my-tickets')} 
                className="btn btn-primary"
              >
                View My Tickets
              </button>
              <button 
                onClick={() => navigate('/events')} 
                className="btn btn-outline"
              >
                Browse More Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <button
          onClick={() => navigate('/dashboard/attendee')}
          className="back-button"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="payment-content">
          <div className="booking-summary">
            <h2>Complete Your Payment</h2>
            
            <div className="booking-info">
              <h3>{booking.event?.title}</h3>
              <div className="booking-meta">
                <p><strong>Booking ID:</strong> {booking.bookingCode}</p>
                <p><strong>Date:</strong> {new Date(booking.event?.startAt).toLocaleDateString()}</p>
                <p><strong>Venue:</strong> {booking.event?.venueName}, {booking.event?.city}</p>
              </div>
            </div>

            <div className="ticket-breakdown">
              <h4>Ticket Details</h4>
              {booking.items?.map((item, index) => (
                <div key={index} className="ticket-item">
                  <span>{item.ticketType?.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              
              <div className="total-row">
                <span><strong>Total Amount</strong></span>
                <span><strong>₹{booking.total?.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          <div className="payment-form">
            {paymentStatus === 'failed' && (
              <div className="error-message">
                <AlertCircle size={20} />
                <p>Payment failed. Please try again with a different payment method.</p>
              </div>
            )}
            
            <StripeCheckout
              bookingId={booking.id}
              amount={booking.total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;