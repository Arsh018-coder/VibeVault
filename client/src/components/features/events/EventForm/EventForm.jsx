import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Plus, Trash2, Loader2 } from 'lucide-react';
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
        toast.error('Failed to load categories');
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
        ticketTypes: data.ticketTypes.filter(ticket => ticket.name && ticket.price)
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="text-gray-600">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {eventId ? 'Edit Event' : 'Create New Event'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {eventId ? 'Update your event details below.' : 'Fill in the details to create your event.'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Event Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    {...register('title', { required: 'Title is required' })}
                    disabled={isSubmitting}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows="4"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    {...register('description', { required: 'Description is required' })}
                    disabled={isSubmitting}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="categoryId"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    {...register('categoryId')}
                    disabled={isSubmitting}
                  >
                    <option value="">Select category (optional)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startAt" className="block text-sm font-medium text-gray-700">
                      Start Date & Time *
                    </label>
                    <input
                      id="startAt"
                      type="datetime-local"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      {...register('startAt', { required: 'Start date is required' })}
                      disabled={isSubmitting}
                    />
                    {errors.startAt && <p className="mt-1 text-sm text-red-600">{errors.startAt.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="endAt" className="block text-sm font-medium text-gray-700">
                      End Date & Time *
                    </label>
                    <input
                      id="endAt"
                      type="datetime-local"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      {...register('endAt', { required: 'End date is required' })}
                      disabled={isSubmitting}
                    />
                    {errors.endAt && <p className="mt-1 text-sm text-red-600">{errors.endAt.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                    Event Capacity
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    min="1"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    {...register('capacity', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-sm text-gray-500">Leave empty for unlimited capacity</p>
                </div>
              </div>

              {/* Location Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Location Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value={false}
                          {...register('isVirtual', { required: true })}
                          disabled={isSubmitting}
                          className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Physical Event</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value={true}
                          {...register('isVirtual', { required: true })}
                          disabled={isSubmitting}
                          className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Virtual Event</span>
                      </label>
                    </div>
                  </div>

                  {!isVirtual && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
                          Venue Name *
                        </label>
                        <input
                          id="venueName"
                          type="text"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                          {...register('venueName', { required: !isVirtual ? 'Venue name is required' : false })}
                          disabled={isSubmitting}
                        />
                        {errors.venueName && <p className="mt-1 text-sm text-red-600">{errors.venueName.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                          Street Address *
                        </label>
                        <input
                          id="street"
                          type="text"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                          {...register('street', { required: !isVirtual ? 'Street address is required' : false })}
                          disabled={isSubmitting}
                        />
                        {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City *
                          </label>
                          <input
                            id="city"
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register('city', { required: !isVirtual ? 'City is required' : false })}
                            disabled={isSubmitting}
                          />
                          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                            State *
                          </label>
                          <input
                            id="state"
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register('state', { required: !isVirtual ? 'State is required' : false })}
                            disabled={isSubmitting}
                          />
                          {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                            Zip Code *
                          </label>
                          <input
                            id="zipCode"
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register('zipCode', { required: !isVirtual ? 'Zip code is required' : false })}
                            disabled={isSubmitting}
                          />
                          {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>}
                        </div>

                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country *
                          </label>
                          <input
                            id="country"
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register('country', { required: !isVirtual ? 'Country is required' : false })}
                            disabled={isSubmitting}
                          />
                          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {isVirtual && (
                    <div>
                      <label htmlFor="virtualLink" className="block text-sm font-medium text-gray-700">
                        Virtual Event Link *
                      </label>
                      <input
                        id="virtualLink"
                        type="url"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        {...register('virtualLink', { required: isVirtual ? 'Virtual link is required' : false })}
                        disabled={isSubmitting}
                        placeholder="https://zoom.us/j/..."
                      />
                      {errors.virtualLink && <p className="mt-1 text-sm text-red-600">{errors.virtualLink.message}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Types */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Ticket Types</h3>
                    <p className="text-sm text-gray-500">Define the different types of tickets for your event</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTicket}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ticket Type
                  </button>
                </div>

                <div className="space-y-6">
                  {fields.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">Ticket Type {index + 1}</h4>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={isSubmitting}
                            className="inline-flex items-center p-1 border border-transparent rounded-full text-red-400 hover:text-red-600 focus:outline-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Type *
                          </label>
                          <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register(`ticketTypes.${index}.type`, { required: 'Ticket type is required' })}
                            disabled={isSubmitting}
                          >
                            <option value="">Select Type</option>
                            {ticketTypesOptions.map(opt => (
                              <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                            ))}
                          </select>
                          {errors.ticketTypes?.[index]?.type && (
                            <p className="mt-1 text-sm text-red-600">{errors.ticketTypes[index].type.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Name *
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            {...register(`ticketTypes.${index}.name`, { required: 'Ticket name is required' })}
                            disabled={isSubmitting}
                            placeholder="e.g., General Admission"
                          />
                          {errors.ticketTypes?.[index]?.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.ticketTypes[index].name.message}</p>
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

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
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
