// Mock authentication API for demo purposes
export const authAPI = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser = {
      id: 1,
      email: credentials.email,
      role: credentials.email.includes('organizer') ? 'organizer' : 'attendee',
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      }
    };

    const mockToken = 'mock-jwt-token-' + Date.now();
    
    return {
      user: mockUser,
      token: mockToken
    };
  },

  register: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user creation
    const mockUser = {
      id: Date.now(),
      email: userData.email,
      role: userData.role,
      profile: userData.profile
    };

    const mockToken = 'mock-jwt-token-' + Date.now();
    
    return {
      user: mockUser,
      token: mockToken
    };
  },

  verifyToken: async (token) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (token.startsWith('mock-jwt-token-')) {
      return {
        id: 1,
        email: 'user@example.com',
        role: 'attendee',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      };
    }
    
    throw new Error('Invalid token');
  },

  forgotPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Password reset email sent' };
  },

  resetPassword: async (token, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Password reset successful' };
  },

  updateProfile: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { user: userData };
  }
};
