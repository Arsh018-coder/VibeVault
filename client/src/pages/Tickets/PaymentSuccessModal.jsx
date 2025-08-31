import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccessModal.css';

const PaymentSuccessModal = ({ onClose, bookingId }) => {
  const navigate = useNavigate();

  const handleViewTickets = () => {
    onClose();
    navigate('/my-tickets');
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <div className="success-icon-container">
          <CheckCircle size={64} className="success-icon" />
        </div>
        <h2>Payment Successful!</h2>
        <p className="success-message">
          Your booking has been confirmed. A confirmation email has been sent to your registered email address.
        </p>
        
        <div className="booking-details">
          <h3>Booking Details</h3>
          <div className="detail-row">
            <span className="detail-label">Booking Reference:</span>
            <span className="detail-value">{bookingId || 'N/A'}</span>
          </div>
          <div className="detail-note">
            Please keep this reference number for your records.
          </div>
        </div>
        
        <div className="button-group">
          <button 
            className="btn btn-primary"
            onClick={handleViewTickets}
          >
            View My Tickets
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleGoHome}
          >
            Back to Home
          </button>
        </div>
        
        <div className="support-note">
          Need help? Contact our <a href="/support">support team</a>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
