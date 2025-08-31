import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { Menu, X, User, LogOut, Settings, ShoppingCart } from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    setCartItemCount(getCartItemCount());
  }, [getCartItemCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-text">VibeVault</span>
          </Link>

          {/* Navigation */}
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <Link to="/events" className="nav-link">Events</Link>
            <Link to="/categories" className="nav-link">Categories</Link>
            {user && (
              <Link 
                to={user.role === 'ORGANIZER' ? '/dashboard/organizer' : '/dashboard/attendee'} 
                className="nav-link"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="header-actions">
            {user ? (
              <div className="profile-menu">
                <button 
                  className="profile-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <User size={20} />
                  <span>{user.firstName || user.email}</span>
                </button>
                
                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      <Settings size={16} />
                      Profile
                    </Link>
                    <Link to="/cart" className="dropdown-item">
                      <ShoppingCart size={16} />
                      Cart {cartItemCount > 0 && `(${cartItemCount})`}
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
