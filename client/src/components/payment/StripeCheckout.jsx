import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import './StripeCheckout.css';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

const CheckoutForm = ({ bookingId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await api.post('/payments/initiate', {
          bookingId,
          provider: 'stripe'
        });
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
        onError?.(err);
      }
    };

    if (bookingId) {
      createPaymentIntent();
    }
  }, [bookingId, onError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setError(error.message);
        onError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await api.post('/payments/confirm', {
          paymentIntentId: paymentIntent.id
        });
        
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      onError?.(err);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-checkout-form">
      <div className="payment-header">
        <div className="payment-icon">
          <CreditCard size={24} />
        </div>
        <h3>Payment Details</h3>
        <div className="security-badge">
          <Lock size={16} />
          <span>Secured by Stripe</span>
        </div>
      </div>

      <div className="payment-amount">
        <span className="amount-label">Total Amount:</span>
        <span className="amount-value">₹{amount.toLocaleString()}</span>
      </div>

      <div className="card-element-container">
        <label htmlFor="card-element">
          Card Information
        </label>
        <div className="card-element-wrapper">
          <CardElement
            id="card-element"
            options={cardElementOptions}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || !clientSecret}
        className={`pay-button ${processing ? 'processing' : ''}`}
      >
        {processing ? (
          <>
            <div className="spinner"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock size={16} />
            Pay ₹{amount.toLocaleString()}
          </>
        )}
      </button>

      <div className="payment-security">
        <p>
          <Lock size={14} />
          Your payment information is secure and encrypted
        </p>
      </div>
    </form>
  );
};

const StripeCheckout = ({ bookingId, amount, onSuccess, onError }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        bookingId={bookingId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripeCheckout;