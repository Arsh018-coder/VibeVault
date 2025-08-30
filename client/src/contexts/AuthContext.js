import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/authAPI';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        error: null 
      };
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload, user: null, token: null };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      authAPI.getProfile()
        .then(response => {
          dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.user, token } });
        })
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_ERROR', payload: 'Token invalid' });
        });
    } else {
      dispatch({ type: 'AUTH_ERROR', payload: null });
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const data = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.register(userData);
      // Return the response with email for verification
      return { ...response, email: userData.email };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const verifyEmail = async ({ email, otp }) => {
    try {
      const response = await authAPI.verifyOtp({ email, otp });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
            token: response.token
          }
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Verification failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    verifyEmail,
    isAuthenticated: !!state.token,
    isLoading: state.loading,
    error: state.error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
