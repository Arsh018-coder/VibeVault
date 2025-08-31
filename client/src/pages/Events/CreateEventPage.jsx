import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../../components/features/events/EventForm/EventForm';
import './CreateEventPage.css';

const CreateEventPage = () => {
  const navigate = useNavigate();

  const handleEventCreated = (eventData) => {
    // Navigate to the organizer dashboard or event details after creation
    navigate('/dashboard/organizer', { 
      state: { message: 'Event created successfully!' } 
    });
  };

  const handleCancel = () => {
    navigate('/dashboard/organizer');
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <div className="create-event-header">
          <h1 className="create-event-title">Create New Event</h1>
        </div>
        
        <div className="create-event-content">
          <EventForm 
            onSuccess={handleEventCreated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;