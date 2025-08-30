import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import './EventForm.css';

const categories = ['Workshop', 'Concert', 'Sports', 'Hackathon'];

const ticketTypesOptions = ['General', 'VIP', 'Student', 'Early Bird'];

const defaultTicket = {
  type: '',
  name: '',
  description: '',
  price: 0,
  currency: 'INR',
  quantityTotal: 0,
  quantityAvailable: 0,
  saleStart: '',
  saleEnd: '',
  perUserLimit: 1,
  isActive: true
};

const EventForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      dateStart: '',
      dateEnd: '',
      locationType: 'physical',
      venueName: '',
      venueAddress: '',
      venueCity: '',
      venueState: '',
      venueZip: '',
      venueCountry: '',
      virtualLink: '',
      tickets: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tickets'
  });

  useEffect(() => {
    if (eventId) {
      (async () => {
        try {
          const res = await api.get(`/events/${eventId}`);
          const event = res.data.event;
          // Map event data to form values for edit
          reset({
            title: event.title,
            description: event.description,
            category: event.category,
            dateStart: event.dateTime.start.slice(0, 16),
            dateEnd: event.dateTime.end.slice(0, 16),
            locationType: event.location.type,
            venueName: event.location.venue?.name || '',
            venueAddress: event.location.venue?.address?.street || '',
            venueCity: event.location.venue?.address?.city || '',
            venueState: event.location.venue?.address?.state || '',
            venueZip: event.location.venue?.address?.zipCode || '',
            venueCountry: event.location.venue?.address?.country || '',
            virtualLink: event.location.virtualLink || '',
            tickets: event.tickets.map(t => ({
              type: t.type,
              name: t.name,
              description: t.description || '',
              price: t.price,
              currency: t.currency,
              quantityTotal: t.quantity.total,
              quantityAvailable: t.quantity.available,
              saleStart: t.saleWindow.start.slice(0, 16),
              saleEnd: t.saleWindow.end.slice(0, 16),
              perUserLimit: t.perUserLimit,
              isActive: t.isActive
            }))
          });
        } catch (err) {
          toast.error('Failed to load event for editing');
        }
      })();
    }
  }, [eventId, reset]);

  // Add new ticket field
  const handleAddTicket = () => {
    append(defaultTicket);
  };

  // Submit handler
  const onSubmit = async (data) => {
    const processedData = {
      title: data.title,
      description: data.description,
      category: data.category,
      dateTime: {
        start: data.dateStart,
        end: data.dateEnd
      },
      location: {
        type: data.locationType,
        venue: data.locationType === 'physical' ? {
          name: data.venueName,
          address: {
            street: data.venueAddress,
            city: data.venueCity,
            state: data.venueState,
            zipCode: data.venueZip,
            country: data.venueCountry,
          }
        } : null,
        virtualLink: data.locationType === 'virtual' ? data.virtualLink : ''
      },
      tickets: data.tickets.map(t => ({
        type: t.type,
        name: t.name,
        description: t.description,
        price: parseFloat(t.price),
        currency: t.currency,
        quantity: {
          total: parseInt(t.quantityTotal, 10),
          available: parseInt(t.quantityAvailable, 10)
        },
        saleWindow: {
          start: t.saleStart,
          end: t.saleEnd
        },
        perUserLimit: parseInt(t.perUserLimit, 10),
        isActive: t.isActive
      }))
    };

    try {
      if (eventId) {
        await api.put(`/events/${eventId}`, processedData);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/events', processedData);
        toast.success('Event created successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save event');
    }
  };

  const locationType = watch('locationType');

  return (
    <div className="container event-form-page">
      <h2>{eventId ? 'Edit Event' : 'Create Event'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Event Title</label>
          <input
            id="title"
            type="text"
            {...register('title', { required: 'Title is required' })}
            disabled={isSubmitting}
          />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="4"
            {...register('description', { required: 'Description is required' })}
            disabled={isSubmitting}
          ></textarea>
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            {...register('category', { required: 'Category is required' })}
            disabled={isSubmitting}
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="form-error">{errors.category.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="dateStart">Start Date & Time</label>
          <input
            id="dateStart"
            type="datetime-local"
            {...register('dateStart', { required: 'Start date is required' })}
            disabled={isSubmitting}
          />
          {errors.dateStart && <p className="form-error">{errors.dateStart.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="dateEnd">End Date & Time</label>
          <input
            id="dateEnd"
            type="datetime-local"
            {...register('dateEnd', { required: 'End date is required' })}
            disabled={isSubmitting}
          />
          {errors.dateEnd && <p className="form-error">{errors.dateEnd.message}</p>}
        </div>

        <div className="form-group">
          <label>Location Type</label>
          <label><input type="radio" value="physical" {...register('locationType')} disabled={isSubmitting}/> Physical</label>
          <label><input type="radio" value="virtual" {...register('locationType')} disabled={isSubmitting}/> Virtual</label>
        </div>

        {locationType === 'physical' && (
          <>
            <div className="form-group">
              <label htmlFor="venueName">Venue Name</label>
              <input id="venueName" {...register('venueName', { required: 'Venue name required'})} disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="venueAddress">Street Address</label>
              <input id="venueAddress" {...register('venueAddress', { required: 'Address required'})} disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="venueCity">City</label>
              <input id="venueCity" {...register('venueCity', { required: 'City required'})} disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="venueState">State</label>
              <input id="venueState" {...register('venueState', { required: 'State required'})} disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="venueZip">Zip Code</label>
              <input id="venueZip" {...register('venueZip', { required: 'Zip required'})} disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="venueCountry">Country</label>
              <input id="venueCountry" {...register('venueCountry', { required: 'Country required'})} disabled={isSubmitting} />
            </div>
          </>
        )}

        {locationType === 'virtual' && (
          <div className="form-group">
            <label htmlFor="virtualLink">Virtual Event Link (URL)</label>
            <input id="virtualLink" type="url" {...register('virtualLink', { required: 'Link required'})} disabled={isSubmitting} />
          </div>
        )}

        <section>
          <h3>Tickets</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="ticket-fieldset">
              <div className="form-group">
                <label>Ticket Type</label>
                <select
                  {...register(`tickets.${index}.type`, { required: true })}
                  onChange={e => {
                    const val = e.target.value;
                    setValue(`tickets.${index}.type`, val);
                    // If VIP, set price to 2000 automatically as demo for setValue usage
                    if (val === 'VIP') {
                      setValue(`tickets.${index}.price`, 2000);
                    }
                  }}
                >
                  <option value="">Select Type</option>
                  {ticketTypesOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Name</label>
                <input type="text" {...register(`tickets.${index}.name`, { required: true })} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input type="text" {...register(`tickets.${index}.description`)} />
              </div>

              <div className="form-group">
                <label>Price (INR)</label>
                <input type="number" step="0.01" {...register(`tickets.${index}.price`, { valueAsNumber: true, min: 0 })} />
              </div>

              <div className="form-group">
                <label>Total Quantity</label>
                <input type="number" {...register(`tickets.${index}.quantityTotal`, { valueAsNumber: true, min: 0 })} />
              </div>

              <div className="form-group">
                <label>Available Quantity</label>
                <input type="number" {...register(`tickets.${index}.quantityAvailable`, { valueAsNumber: true, min: 0 })} />
              </div>

              <div className="form-group">
                <label>Sale Start</label>
                <input type="datetime-local" {...register(`tickets.${index}.saleStart`)} />
              </div>

              <div className="form-group">
                <label>Sale End</label>
                <input type="datetime-local" {...register(`tickets.${index}.saleEnd`)} />
              </div>

              <div className="form-group">
                <label>Per User Limit</label>
                <input type="number" {...register(`tickets.${index}.perUserLimit`, { valueAsNumber: true, min: 1 })} />
              </div>

              {/* Implemented 'Controller' for custom control of Active checkbox */}
              <div className="form-group">
                <Controller
                  control={control}
                  name={`tickets.${index}.isActive`}
                  render={({ field }) => (
                    <label>
                      <input
                        type="checkbox"
                        checked={!!field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        disabled={isSubmitting}
                      />
                      Active
                    </label>
                  )}
                />
              </div>

              <button type="button" onClick={() => remove(index)} disabled={isSubmitting}>Remove Ticket</button>
              <hr />
            </div>
          ))}

          <button type="button" onClick={handleAddTicket} disabled={isSubmitting}>Add Ticket</button>
        </section>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {eventId ? 'Update Event' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default EventForm;
