import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

const API_URL = 'http://localhost:5000/api/bookings/';

const createRazorpayOrder = async (eventId, seatsBooked, token) => {
  setAuthToken(token);
  const response = await axios.post(API_URL + `razorpay/create-order/${eventId}`, { seatsBooked });
  return response.data;
};

const verifyRazorpayPayment = async (payload, token) => {
  setAuthToken(token);
  const response = await axios.post(API_URL + 'razorpay/verify-payment', payload);
  return response.data;
};

const getUserBookings = async (token) => {
  setAuthToken(token);
  const response = await axios.get(API_URL + 'me');
  return response.data;
};

const getAllBookings = async (token) => {
  setAuthToken(token);
  const response = await axios.get(API_URL + 'admin');
  return response.data;
};

const deleteBooking = async (id, token) => {
  setAuthToken(token);
  const response = await axios.delete(API_URL + id);
  return response.data;
};

const bookingService = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getUserBookings,
  getAllBookings,
  deleteBooking,
};

export default bookingService;
