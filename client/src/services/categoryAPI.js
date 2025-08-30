import api from './api';

export const categoryAPI = {
  // Get all categories
  getAllCategories: async (includeInactive = false) => {
    const response = await api.get('/categories', {
      params: { includeInactive }
    });
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },

  // Get events in a category
  getCategoryEvents: async (slug, params = {}) => {
    const response = await api.get(`/categories/${slug}/events`, { params });
    return response.data;
  },

  // Create category (admin only)
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category (admin only)
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete category (admin only)
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  // Toggle category status (admin only)
  toggleCategoryStatus: async (categoryId) => {
    const response = await api.patch(`/categories/${categoryId}/toggle`);
    return response.data;
  }
};

export default categoryAPI;