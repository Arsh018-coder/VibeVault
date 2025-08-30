import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/authAPI';
import { toast } from 'react-hot-toast';

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Get email from location state or fallback to empty string
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.verifyOtp({ email, otp });
      
      if (response.success) {
        toast.success('Email verified successfully!');
        navigate('/login');
      } else {
        throw new Error(response.message || 'Failed to verify email');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Verify Your Email</h2>
        <p className="auth-subtitle">
          We've sent a 6-digit verification code to <strong>{email || 'your email'}</strong>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="otp" className="form-label">
              Enter Verification Code
            </label>
            <input
              id="otp"
              type="text"
              className="otp-input"
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="\d{6}"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive a code?{' '}
            <button 
              className="resend-code"
              onClick={() => toast('Resend functionality coming soon')}
            >
              Resend Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
