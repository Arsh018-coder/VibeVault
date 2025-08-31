import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EventForm from '../../components/features/events/EventForm/EventForm';
import './EditEventPage.css';

const EditEventPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const handleEventUpdated = (eventData) => {
    // Navigate to the organizer dashboard or event details after update
    navigate('/dashboard/organizer', { 
      state: { message: 'Event updated successfully!' } 
    });
  };

  const handleCancel = () => {
    navigate('/dashboard/organizer');
  };

  return (
    <div className="edit-event-page">
      <div className="edit-event-container">
        <div className="edit-event-header">
          <h1 className="edit-event-title">Edit Event</h1>
          <p className="edit-event-subtitle">
            Update your event details and settings
          </p>
        </div>
        
        <div className="edit-event-content">
          <EventForm 
            eventId={eventId}
            isEdit={true}
            onSuccess={handleEventUpdated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;