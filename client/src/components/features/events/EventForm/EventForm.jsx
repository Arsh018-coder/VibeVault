import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Plus, Trash2, Loader2, Upload, X, Image } from 'lucide-react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import './EventForm.css';

const ticketTypesOptions = ['GENERAL', 'VIP', 'STUDENT', 'EARLY_BIRD'];

const defaultTicket = {
  type: 'GENERAL',
  name: '',
  description: '',
  price: 0,
  currency: 'INR',
  qtyTotal: 0,
  qtyAvailable: 0,
  saleStart: '',
  saleEnd: '',
  perUserLimit: 1,
  isActive: true
};

const EventForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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
      categoryId: '',
      startAt: '',
      endAt: '',
      timezone: 'Asia/Kolkata',
      isVirtual: false,
      venueName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      virtualLink: '',
      capacity: '',
      ticketTypes: [defaultTicket]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTypes'
  });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        // Don't show error toast, just continue without categories
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Load existing event for editing
  useEffect(() => {
    if (eventId) {
      const loadEvent = async () => {
        try {
          const response = await api.get(`/events/${eventId}`);
          const event = response.data.event || response.data;

          // Format dates for datetime-local inputs
          const formatDateForInput = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toISOString().slice(0, 16);
          };

          reset({
            title: event.title || '',
            description: event.description || '',
            categoryId: event.categoryId || '',
            startAt: formatDateForInput(event.startAt),
            endAt: formatDateForInput(event.endAt),
            timezone: event.timezone || 'Asia/Kolkata',
            isVirtual: event.isVirtual || false,
            venueName: event.venueName || '',
            street: event.street || '',
            city: event.city || '',
            state: event.state || '',
            zipCode: event.zipCode || '',
            country: event.country || 'India',
            virtualLink: event.virtualLink || '',
            capacity: event.capacity || '',
            ticketTypes: event.ticketTypes?.map(t => ({
              type: t.type || 'GENERAL',
              name: t.name || '',
              description: t.description || '',
              price: t.price || 0,
              currency: t.currency || 'INR',
              qtyTotal: t.qtyTotal || 0,
              qtyAvailable: t.qtyAvailable || 0,
              saleStart: formatDateForInput(t.saleStart),
              saleEnd: formatDateForInput(t.saleEnd),
              perUserLimit: t.perUserLimit || 1,
              isActive: t.isActive !== false
            })) || [defaultTicket]
          });
        } catch (err) {
          console.error('Failed to load event:', err);
          toast.error('Failed to load event for editing');
        }
      };
      loadEvent();
    }
  }, [eventId, reset]);

  // Add new ticket field
  const handleAddTicket = () => {
    append(defaultTicket);
  };

  // Image handling functions
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await api.post('/events/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedImages = response.data.images || [];
      setImages(prev => [...prev, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully!`);
    } catch (err) {
      console.error('Failed to upload images:', err);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  };

  // Submit handler
  const onSubmit = async (data) => {
    try {
      // Process the form data to match the database schema
      const eventData = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId || null,
        startAt: data.startAt,
        endAt: data.endAt,
        timezone: data.timezone,
        isVirtual: data.isVirtual,
        venueName: data.isVirtual ? null : data.venueName,
        street: data.isVirtual ? null : data.street,
        city: data.isVirtual ? null : data.city,
        state: data.isVirtual ? null : data.state,
        zipCode: data.isVirtual ? null : data.zipCode,
        country: data.isVirtual ? null : data.country,
        virtualLink: data.isVirtual ? data.virtualLink : null,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        visibility: 'PUBLIC',
        ticketTypes: data.ticketTypes.filter(ticket => ticket.name && ticket.price),
        images: images.map(img => ({
          url: img.url,
          alt: img.alt || data.title,
          isPrimary: img.isPrimary || false
        }))
      };

      if (eventId) {
        await api.put(`/events/${eventId}`, eventData);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/events', eventData);
        toast.success('Event created successfully!');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save event:', err);
      toast.error(err.response?.data?.message || 'Failed to save event');
    }
  };

  const isVirtual = watch('isVirtual');

  if (loadingCategories) {
    return (
      <div className="event-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-form-container">
      <div className="event-form-wrapper">
        <div className="event-form-card">
          <div className="event-form-header">
            <h1>{eventId ? 'Edit Event' : 'Create New Event'}</h1>
            <p>{eventId ? 'Update your event details below.' : 'Fill in the details to create your event.'}</p>
          </div>

          <div className="event-form-content">

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Basic Information */}
              <div className="form-section">
                <h2 className="section-title">
                  <Calendar size={20} />
                  Basic Information
                </h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label required">
                      Event Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      className="form-input"
                      {...register('title', { required: 'Title is required' })}
                      disabled={isSubmitting}
                      placeholder="Enter your event title"
                    />
                    {errors.title && <p className="form-error">{errors.title.message}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="description" className="form-label required">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows="4"
                      className="form-textarea"
                      {...register('description', { required: 'Description is required' })}
                      disabled={isSubmitting}
                      placeholder="Describe your event in detail"
                    />
                    {errors.description && <p className="form-error">{errors.description.message}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="categoryId" className="form-label">
                      Category
                    </label>
                    <select
                      id="categoryId"
                      className="form-select"
                      {...register('categoryId')}
                      disabled={isSubmitting}
                    >
                      <option value="">Select category (optional)</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label htmlFor="startAt" className="form-label required">
                        Start Date & Time
                      </label>
                      <input
                        id="startAt"
                        type="datetime-local"
                        className="form-input"
                        {...register('startAt', { required: 'Start date is required' })}
                        disabled={isSubmitting}
                      />
                      {errors.startAt && <p className="form-error">{errors.startAt.message}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="endAt" className="form-label required">
                        End Date & Time
                      </label>
                      <input
                        id="endAt"
                        type="datetime-local"
                        className="form-input"
                        {...register('endAt', { required: 'End date is required' })}
                        disabled={isSubmitting}
                      />
                      {errors.endAt && <p className="form-error">{errors.endAt.message}</p>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="capacity" className="form-label">
                      Event Capacity
                    </label>
                    <input
                      id="capacity"
                      type="number"
                      min="1"
                      className="form-input"
                      {...register('capacity', { valueAsNumber: true })}
                      disabled={isSubmitting}
                      placeholder="Enter maximum capacity"
                    />
                    <p className="form-help">Leave empty for unlimited capacity</p>
                  </div>
                </div>
              </div>

              {/* Event Images */}
              <div className="form-section">
                <h2 className="section-title">
                  <Image size={20} />
                  Event Images
                </h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Upload Images
                    </label>
                    <div className="image-upload-area">
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        disabled={uploadingImages || isSubmitting}
                        className="image-upload-input"
                      />
                      <label htmlFor="image-upload" className="image-upload-label">
                        <Upload size={24} />
                        <span>
                          {uploadingImages ? 'Uploading...' : 'Click to upload images or drag and drop'}
                        </span>
                        <small>PNG, JPG, GIF up to 5MB each</small>
                      </label>
                    </div>
                    
                    {images.length > 0 && (
                      <div className="uploaded-images">
                        <h4>Uploaded Images</h4>
                        <div className="image-grid">
                          {images.map((image, index) => (
                            <div key={index} className="image-item">
                              <img src={image.url} alt={`Event image ${index + 1}`} />
                              <div className="image-actions">
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(index)}
                                  className={`primary-btn ${image.isPrimary ? 'active' : ''}`}
                                  disabled={isSubmitting}
                                >
                                  {image.isPrimary ? 'Primary' : 'Set Primary'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="remove-btn"
                                  disabled={isSubmitting}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="form-section">
                <h2 className="section-title">
                  <MapPin size={20} />
                  Location Details
                </h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">
                      Event Type
                    </label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          value="false"
                          checked={!isVirtual}
                          onChange={() => setValue('isVirtual', false, { shouldValidate: true })}
                          disabled={isSubmitting}
                          className="radio-input"
                        />
                        <span className="radio-label">Physical Event</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          value="true"
                          checked={isVirtual}
                          onChange={() => setValue('isVirtual', true, { shouldValidate: true })}
                          disabled={isSubmitting}
                          className="radio-input"
                        />
                        <span className="radio-label">Virtual Event</span>
                      </label>
                    </div>
                  </div>

                  {!isVirtual && (
                    <>
                      <div className="form-group">
                        <label htmlFor="venueName" className="form-label required">
                          Venue Name
                        </label>
                        <input
                          id="venueName"
                          type="text"
                          className="form-input"
                          {...register('venueName', { required: !isVirtual ? 'Venue name is required' : false })}
                          disabled={isSubmitting}
                          placeholder="Enter venue name"
                        />
                        {errors.venueName && <p className="form-error">{errors.venueName.message}</p>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="street" className="form-label required">
                          Street Address
                        </label>
                        <input
                          id="street"
                          type="text"
                          className="form-input"
                          {...register('street', { required: !isVirtual ? 'Street address is required' : false })}
                          disabled={isSubmitting}
                          placeholder="Enter street address"
                        />
                        {errors.street && <p className="form-error">{errors.street.message}</p>}
                      </div>

                      <div className="form-grid form-grid-2">
                        <div className="form-group">
                          <label htmlFor="city" className="form-label required">
                            City
                          </label>
                          <input
                            id="city"
                            type="text"
                            className="form-input"
                            {...register('city', { required: !isVirtual ? 'City is required' : false })}
                            disabled={isSubmitting}
                            placeholder="Enter city"
                          />
                          {errors.city && <p className="form-error">{errors.city.message}</p>}
                        </div>

                        <div className="form-group">
                          <label htmlFor="state" className="form-label required">
                            State
                          </label>
                          <input
                            id="state"
                            type="text"
                            className="form-input"
                            {...register('state', { required: !isVirtual ? 'State is required' : false })}
                            disabled={isSubmitting}
                            placeholder="Enter state"
                          />
                          {errors.state && <p className="form-error">{errors.state.message}</p>}
                        </div>
                      </div>

                      <div className="form-grid form-grid-2">
                        <div className="form-group">
                          <label htmlFor="zipCode" className="form-label required">
                            Zip Code
                          </label>
                          <input
                            id="zipCode"
                            type="text"
                            className="form-input"
                            {...register('zipCode', { required: !isVirtual ? 'Zip code is required' : false })}
                            disabled={isSubmitting}
                            placeholder="Enter zip code"
                          />
                          {errors.zipCode && <p className="form-error">{errors.zipCode.message}</p>}
                        </div>

                        <div className="form-group">
                          <label htmlFor="country" className="form-label required">
                            Country
                          </label>
                          <input
                            id="country"
                            type="text"
                            className="form-input"
                            {...register('country', { required: !isVirtual ? 'Country is required' : false })}
                            disabled={isSubmitting}
                            placeholder="Enter country"
                          />
                          {errors.country && <p className="form-error">{errors.country.message}</p>}
                        </div>
                      </div>
                    </>
                  )}

                  {isVirtual && (
                    <div className="form-group">
                      <label htmlFor="virtualLink" className="form-label required">
                        Virtual Event Link
                      </label>
                      <input
                        id="virtualLink"
                        type="url"
                        className="form-input"
                        {...register('virtualLink', { required: isVirtual ? 'Virtual link is required' : false })}
                        disabled={isSubmitting}
                        placeholder="https://zoom.us/j/..."
                      />
                      {errors.virtualLink && <p className="form-error">{errors.virtualLink.message}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Types */}
              <div className="form-section">
                <div className="ticket-types-header">
                  <div className="ticket-types-info">
                    <h3>
                      <Ticket size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Ticket Types
                    </h3>
                    <p>Define the different types of tickets for your event</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTicket}
                    disabled={isSubmitting}
                    className="add-ticket-btn"
                  >
                    <Plus size={16} />
                    Add Ticket Type
                  </button>
                </div>

                <div>
                  {fields.map((item, index) => (
                    <div key={item.id} className="ticket-card">
                      <div className="ticket-card-header">
                        <h4 className="ticket-card-title">Ticket Type {index + 1}</h4>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={isSubmitting}
                            className="remove-ticket-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="form-grid form-grid-2">
                        <div className="form-group">
                          <label className="form-label required">
                            Type
                          </label>
                          <select
                            className="form-select"
                            {...register(`ticketTypes.${index}.type`, { required: 'Ticket type is required' })}
                            disabled={isSubmitting}
                          >
                            <option value="">Select Type</option>
                            {ticketTypesOptions.map(opt => (
                              <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                            ))}
                          </select>
                          {errors.ticketTypes?.[index]?.type && (
                            <p className="form-error">{errors.ticketTypes[index].type.message}</p>
                          )}
                        </div>

                        <div className="form-group">
                          <label className="form-label required">
                            Name
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            {...register(`ticketTypes.${index}.name`, { required: 'Ticket name is required' })}
                            disabled={isSubmitting}
                            placeholder="e.g., General Admission"
                          />
                          {errors.ticketTypes?.[index]?.name && (
                            <p className="form-error">{errors.ticketTypes[index].name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Price (₹) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register(`ticketTypes.${index}.price`, { required: 'Price is required', valueAsNumber: true, min: 0 })}
                            disabled={isSubmitting}
                          />
                          {errors.ticketTypes?.[index]?.price && (
                            <p className="mt-1 text-sm text-red-600">{errors.ticketTypes[index].price.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Total Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register(`ticketTypes.${index}.qtyTotal`, { required: 'Quantity is required', valueAsNumber: true, min: 1 })}
                            disabled={isSubmitting}
                            onChange={(e) => {
                              // Auto-set available quantity to match total quantity
                              setValue(`ticketTypes.${index}.qtyAvailable`, parseInt(e.target.value) || 0);
                            }}
                          />
                          {errors.ticketTypes?.[index]?.qtyTotal && (
                            <p className="mt-1 text-sm text-red-600">{errors.ticketTypes[index].qtyTotal.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Per User Limit
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register(`ticketTypes.${index}.perUserLimit`, { valueAsNumber: true, min: 1 })}
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register(`ticketTypes.${index}.description`)}
                            disabled={isSubmitting}
                            placeholder="Optional description for this ticket type"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
                >
                  {isSubmitting && <Loader2 className="loading-spinner" />}
                  {eventId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
