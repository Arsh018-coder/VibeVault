import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AuthPage.css';

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  if (user) return <Navigate to="/" />;

  const onSubmit = async (data) => {
    try {
      const userData = await login(data);
      toast.success('Logged in successfully!');
      
      // Navigate based on user role
      if (userData.user.role === 'ORGANIZER') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <h2>Login</h2>

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
            {...register('password', { required: 'Password is required' })}
            disabled={isSubmitting}
          />
          {errors.password && <p className="form-error">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Sign up</Link></p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
