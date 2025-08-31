import api from './api';

// Simulated payment processing
export const processPayment = async (paymentData) => {
  // In a real app, this would call your payment processing API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        timestamp: new Date().toISOString()
      });
    }, 1000); // Simulate network delay
  });
};

export const bookingAPI = {
  // Get user's bookings
  getUserBookings: async (params = {}) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },

  // Create a new booking with payment processing
  createBooking: async (bookingData) => {
    // Process payment first
    const paymentResponse = await processPayment({
      amount: bookingData.totalAmount,
      currency: bookingData.currency || 'INR',
      description: `Booking for ${bookingData.eventTitle}`,
      metadata: {
        eventId: bookingData.eventId,
        ticketTypes: bookingData.tickets
      }
    });

    if (!paymentResponse.success) {
      throw new Error('Payment processing failed');
    }

    // Create booking with payment reference
    const response = await api.post('/bookings', {
      ...bookingData,
      payment: {
        transactionId: paymentResponse.transactionId,
        amount: paymentResponse.amount,
        currency: paymentResponse.currency,
        status: 'completed',
        method: 'card'
      }
    });
    
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