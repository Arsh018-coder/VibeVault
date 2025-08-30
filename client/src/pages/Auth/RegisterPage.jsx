import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AuthPage.css';

const RegisterPage = () => {
  const { user, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  if (user) return <Navigate to="/" />;

  const onSubmit = async (data) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName
        }
      });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <h2>Register</h2>

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
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
