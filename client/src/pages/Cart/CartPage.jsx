import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import './CartPage.css';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    // Navigate to checkout page when implemented
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container cart-page">
        <h2>Your Cart</h2>
        <div className="empty-cart">
          <i className="bi bi-cart-x"></i>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added any tickets yet.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/events')}
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {items.map((item) => (
          <div key={`${item.eventId}-${item.ticketType}`} className="cart-item">
            <div className="item-details">
              <h3>{item.eventTitle}</h3>
              <p className="ticket-type">{item.ticketType}</p>
              <p className="event-date">{item.eventDate} • {item.eventTime}</p>
              <p className="event-location">{item.location}</p>
            </div>
            <div className="item-quantity">
              <button 
                onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity || 1}</span>
              <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>
                +
              </button>
            </div>
            <div className="item-price">
              ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
            </div>
            <button 
              className="remove-item"
              onClick={() => removeFromCart(item.id)}
              title="Remove from cart"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="total">
          <span>Total:</span>
          <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
        </div>
        <button 
          className="btn btn-primary checkout-btn"
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
