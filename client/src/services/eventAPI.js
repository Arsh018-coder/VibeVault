import api from './api';

export const eventAPI = {
  // Get all events with filters
  getAllEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get featured events
  getFeaturedEvents: async () => {
    const response = await api.get('/events/featured');
    return response.data;
  },

  // Get event by slug
  getEventBySlug: async (slug) => {
    const response = await api.get(`/events/${slug}`);
    return response.data;
  },

  // Get event tickets
  getEventTickets: async (eventId) => {
    const response = await api.get(`/events/${eventId}/tickets`);
    return response.data;
  },

  // Search events
  searchEvents: async (query, filters = {}) => {
    const response = await api.get('/events/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Create event (organizer/admin only)
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Update event (organizer/admin only)
  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  },

  // Delete event (organizer/admin only)
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },

  // Update event status
  updateEventStatus: async (eventId, status) => {
    const response = await api.patch(`/events/${eventId}/status`, { status });
    return response.data;
  },

  // Toggle featured status (admin only)
  toggleFeatured: async (eventId) => {
    const response = await api.patch(`/events/${eventId}/feature`);
    return response.data;
  }
};

export default eventAPI;