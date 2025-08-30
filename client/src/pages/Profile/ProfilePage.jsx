import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await api.put('/auth/me', {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      updateUser(response.data.user);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  if (!user) {
    return <div>Please log in to see profile.</div>;
  }

  return (
    <div className="container profile-page">
      <h2>My Profile</h2>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ marginBottom: '1rem' }}
        onClick={() => setEditMode(mode => !mode)}
        disabled={isSubmitting}
      >
        {editMode ? 'Cancel Edit' : 'Edit Profile'}
      </button>
      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            id="firstName"
            type="text"
            className="form-input"
            {...register('firstName', { required: 'First name is required' })}
            disabled={isSubmitting || !editMode}
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
            disabled={isSubmitting || !editMode}
          />
          {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email (cannot change)</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={user.email}
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input
            id="phone"
            type="tel"
            className="form-input"
            {...register('phone')}
            disabled={isSubmitting || !editMode}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !editMode}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
