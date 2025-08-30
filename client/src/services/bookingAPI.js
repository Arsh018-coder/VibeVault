import api from './api';

export const bookingAPI = {
  // Get user's bookings
  getUserBookings: async (params = {}) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason = '') => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  // Get event bookings (organizer/admin only)
  getEventBookings: async (eventId, params = {}) => {
    const response = await api.get(`/bookings/event/${eventId}`, { params });
    return response.data;
  },

  // Confirm booking (organizer/admin only)
  confirmBooking: async (bookingId) => {
    const response = await api.patch(`/bookings/${bookingId}/confirm`);
    return response.data;
  },

  // Get all bookings (admin only)
  getAllBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  }
};

export default bookingAPI;