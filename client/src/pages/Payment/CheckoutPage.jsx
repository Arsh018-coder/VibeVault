import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/bookingAPI';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed
  const [bookingData, setBookingData] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  useEffect(() => {
    if (!location.state?.bookingData) {
      toast.error('Invalid booking session');
      navigate('/events');
      return;
    }
    setBookingData(location.state.bookingData);
    setLoading(false);
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces after every 4 digits
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // Format expiry date with slash
    if (name === 'expiry') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(?=\d)/, '$1/')
        .slice(0, 5);
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // Format CVC (3-4 digits)
    if (name === 'cvc') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!formData.expiry || !/\d{2}\/\d{2}/.test(formData.expiry)) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!formData.cvc || formData.cvc.length < 3) {
      toast.error('Please enter a valid CVC');
      return false;
    }
    
    if (!formData.name) {
      toast.error('Please enter the cardholder name');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Process payment
      const paymentResponse = await bookingAPI.processPayment({
        amount: bookingData.totalAmount,
        currency: bookingData.currency,
        description: `Booking for ${bookingData.eventTitle}`,
        metadata: {
          eventId: bookingData.eventId,
          ticketTypes: bookingData.tickets
        }
      });

      if (!paymentResponse.success) {
        throw new Error('Payment processing failed');
      }
      
      // Create booking with payment reference
      const bookingResponse = await bookingAPI.createBooking({
        ...bookingData,
        payment: {
          transactionId: paymentResponse.transactionId,
          amount: paymentResponse.amount,
          currency: paymentResponse.currency,
          status: 'completed',
          method: 'card'
        },
        status: 'confirmed'
      });
      
      setPaymentStatus('success');
      toast.success('Booking confirmed! Redirecting to your tickets...');
      
      // Redirect to booking confirmation
      setTimeout(() => {
        navigate(`/bookings/${bookingResponse.id}/confirmation`);
      }, 2000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Loader2 className="animate-spin" size={32} />
        <p>Preparing your booking...</p>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="payment-success">
        <div className="success-content">
          <CheckCircle className="success-icon" size={64} />
          <h2>Payment Successful!</h2>
          <p>Your booking has been confirmed. You'll receive a confirmation email shortly.</p>
          <button 
            onClick={() => navigate('/my-tickets')} 
            className="btn btn-primary"
          >
            View My Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-container">
          <div className="checkout-form">
            <h2>Payment Details</h2>
            <p className="subtitle">Complete your booking by entering your payment information</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Card Number</label>
                <div className="input-with-icon">
                  <CreditCard size={20} />
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    disabled={processing}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    disabled={processing}
                  />
                </div>
                
                <div className="form-group">
                  <label>CVC</label>
                  <input
                    type="text"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={4}
                    disabled={processing}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name on card"
                  disabled={processing}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={processing || paymentStatus === 'processing'}
              >
                {processing || paymentStatus === 'processing' ? (
                  <>
                    <Loader2 className="animate-spin" size={20} style={{ marginRight: '8px' }} />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${bookingData.totalAmount.toLocaleString()}`
                )}
              </button>
              
              {paymentStatus === 'failed' && (
                <div className="error-message">
                  <XCircle size={20} style={{ marginRight: '8px' }} />
                  Payment failed. Please try again.
                </div>
              )}
              
              <p className="secure-notice">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Your payment is secured with 256-bit encryption
              </p>
            </form>
          </div>
          
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="event-details">
              <h4>{bookingData.eventTitle}</h4>
              <div className="tickets-list">
                {bookingData.tickets.map((ticket, index) => (
                  <div key={index} className="ticket-item">
                    <div>
                      <span className="ticket-name">{ticket.name}</span>
                      <span className="ticket-quantity">× {ticket.quantity}</span>
                    </div>
                    <span className="ticket-price">₹{(ticket.price * ticket.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <span>Total</span>
                <span>₹{bookingData.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
