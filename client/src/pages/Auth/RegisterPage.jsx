import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPage.css';

const RegisterPage = () => {
  const { user, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [selectedRole, setSelectedRole] = useState('attendee');

  if (user) return <Navigate to="/" />;

  const onSubmit = async (data) => {
    try {
      const userData = await registerUser({
        email: data.email,
        password: data.password,
        role: selectedRole.toUpperCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        phone: '' // Add empty phone number as it's required by the server
      });
      toast.success(userData.message || 'Account created successfully! Please check your email for verification.');
      
      // Navigate to verification page or home based on your flow
      navigate('/verify-email');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">Join VibeVault and start your event journey</p>

        {/* Role Selection */}
        <div className="form-group">
          <label className="form-label">I want to:</label>
          <div className="role-selection">
            <div 
              className={`role-card ${selectedRole === 'attendee' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('attendee')}
            >
              <Users size={24} />
              <h3>Attend Events</h3>
              <p>Discover and book amazing events</p>
            </div>
            <div 
              className={`role-card ${selectedRole === 'organizer' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('organizer')}
            >
              <Calendar size={24} />
              <h3>Organize Events</h3>
              <p>Create and manage your own events</p>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input 
            id="firstName" 
            type="text" 
            className="form-input"
            {...register('firstName', { required: 'First name is required' })}
            disabled={isSubmitting}
          />
          {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input 
            id="lastName" 
            type="text" 
            className="form-input"
            {...register('lastName', { required: 'Last name is required' })}
            disabled={isSubmitting}
          />
          {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input 
            id="email" 
            type="email" 
            className="form-input"
            {...register('email', { required: 'Email is required' })}
            disabled={isSubmitting}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input 
            id="password" 
            type="password" 
            className="form-input"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            disabled={isSubmitting}
          />
          {errors.password && <p className="form-error">{errors.password.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input 
            id="confirmPassword" 
            type="password" 
            className="form-input"
            {...register('confirmPassword', { 
              required: 'Please confirm password',
              validate: (value) => value === watch('password') || 'Passwords do not match'
            })}
            disabled={isSubmitting}
          />
          {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
