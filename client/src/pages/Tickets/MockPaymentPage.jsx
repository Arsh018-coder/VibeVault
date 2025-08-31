import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './MockPaymentPage.css';

const MockPaymentPage = ({ bookingData, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-process payment on component mount
    const processPayment = async () => {
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Always return a successful payment response
        const paymentResponse = {
          transactionId: `mock_txn_${Math.random().toString(36).substr(2, 12)}`,
          amount: bookingData?.totalAmount || 0,
          currency: bookingData?.currency || 'INR',
          status: 'succeeded',
          paymentMethod: 'card',
          cardLast4: '4242',
          timestamp: new Date().toISOString(),
          isMock: true
        };
        
        // Trigger success callback with payment details
        onPaymentSuccess(paymentResponse);
        setPaymentComplete(true);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [bookingData, onPaymentSuccess]);

  if (!bookingData) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="mock-payment-page">
      {loading ? (
        <div className="processing-payment">
          <div className="spinner"></div>
          <h2>Processing Your Payment</h2>
          <p>Please wait while we process your payment...</p>
        </div>
      ) : paymentComplete ? (
        <div className="payment-success">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Payment Successful!</h2>
          <p>Your booking has been confirmed.</p>
          <div className="booking-details">
            <p><strong>Event:</strong> {bookingData.eventTitle || 'N/A'}</p>
            <p><strong>Amount:</strong> ₹{bookingData.totalAmount ? bookingData.totalAmount.toLocaleString() : '0'}</p>
            <p><strong>Transaction ID:</strong> {`mock_txn_${Math.random().toString(36).substr(2, 12)}`}</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/my-tickets')}
            style={{ marginTop: '1.5rem' }}
          >
            View My Tickets
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default MockPaymentPage;
