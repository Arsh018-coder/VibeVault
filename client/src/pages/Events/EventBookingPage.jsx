import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './EventBookingPage.css';

const EventBookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      tickets: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tickets'
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${slug}`);
        setEvent(response.data.event);
        if (response.data.event?.tickets?.length) {
          // Initialize ticket fields with quantity = 0
          const ticketFields = response.data.event.tickets.map(ticket => ({ ticketId: ticket._id, quantity: 0 }));
          ticketFields.forEach(field => append(field));
        }
      } catch (error) {
        toast.error('Failed to load event.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const onSubmit = async (data) => {
    try {
      // Filter tickets with quantity > 0
      const bookedTickets = data.tickets.filter(t => t.quantity > 0);
      if (bookedTickets.length === 0) {
        toast.error('Please select at least one ticket.');
        return;
      }
      const bookingPayload = {
        eventId: event._id,
        tickets: bookedTickets
      };
      await api.post('/bookings', bookingPayload);
      toast.success('Booking successful!');
      navigate('/my-tickets');
    } catch (error) {
      toast.error('Booking failed.');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="error-message">Event not found.</div>;
  }

  return (
    <div className="container event-booking-page">
      <h2>Book Tickets for "{event.title}"</h2>

      {/* Ticket selection form */}
      <form onSubmit={handleSubmit(onSubmit)} className="booking-form">
        {event.tickets.length === 0 && <p>No tickets available for booking.</p>}
        {fields.map((field, index) => {
          const ticket = event.tickets.find(t => t._id === field.ticketId);
          return (
            <div key={field.id} className="ticket-booking-item">
              <label>
                {ticket.name} (₹{ticket.price}) - Available: {ticket.quantity.available}
              </label>
              <input
                type="number"
                min="0"
                max={ticket.quantity.available}
                {...register(`tickets.${index}.quantity`, {
                  min: { value: 0, message: 'Quantity cannot be negative' },
                  max: { value: ticket.quantity.available, message: 'Exceeds available tickets'}
                })}
                disabled={isSubmitting}
                defaultValue="0"
              />
              <button type="button" className="btn btn-secondary btn-remove-ticket" onClick={() => remove(index)} disabled={fields.length === 1 || isSubmitting} style={{marginLeft: '8px'}}>
                Remove
              </button>
              {errors.tickets && errors.tickets[index] && (
                <p className="form-error">{errors.tickets[index].quantity?.message}</p>
              )}
            </div>
          );
        })}

        {/* Live total tickets indicator using watch */}
        <div className="live-ticket-total" style={{marginTop: '1rem'}}>
          <strong>Total tickets selected:</strong> {watch('tickets') ? watch('tickets').reduce((sum, t) => sum + (parseInt(t.quantity, 10) || 0), 0) : 0}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{marginTop: '1rem'}}>
          {isSubmitting ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default EventBookingPage;
