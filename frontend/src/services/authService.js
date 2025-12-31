import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

const API_URL = 'http://localhost:5000/api/auth/';

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  setAuthToken(null);
};

// Get user
const getUser = async () => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }
  const response = await axios.get(API_URL + 'user');
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getUser,
};

export default authService;
