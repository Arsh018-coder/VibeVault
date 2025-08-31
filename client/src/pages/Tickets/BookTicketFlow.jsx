import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MockPaymentPage from './MockPaymentPage';
import PaymentSuccessModal from './PaymentSuccessModal';
import { bookingAPI } from '../../services/bookingAPI';
import { toast } from 'react-hot-toast';

const BookTicketFlow = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.bookingData) {
      setBookingData(location.state.bookingData);
    } else {
      // Redirect if no booking data is provided
      navigate('/events');
    }
  }, [location, navigate]);

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      if (!bookingData) return;
      
      // Create booking with payment details
      const response = await bookingAPI.createBooking({
        ...bookingData,
        payment: {
          ...paymentDetails,
          status: 'completed',
          method: 'card'
        },
        status: 'confirmed'
      });
      
      setBookingId(response.id);
      setShowSuccess(true);
    } catch (error) {
      console.error('Booking creation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    if (bookingId) {
      navigate(`/bookings/${bookingId}`);
    } else {
      navigate('/my-tickets');
    }
  };

  if (!bookingData) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Preparing your booking...</p>
      </div>
    );
  }

  return (
    <div className="ticket-booking-flow">
      <MockPaymentPage 
        bookingData={bookingData}
        onPaymentSuccess={handlePaymentSuccess} 
      />
      {showSuccess && (
        <PaymentSuccessModal 
          onClose={handleCloseSuccess} 
          bookingId={bookingId}
        />
      )}
    </div>
  );
};

export default BookTicketFlow;
