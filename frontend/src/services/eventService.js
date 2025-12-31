import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

const API_URL = 'http://localhost:5000/api/events/';

const getEvents = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getEventById = async (id) => {
  const response = await axios.get(API_URL + id);
  return response.data;
};

const createEvent = async (eventData, token) => {
  setAuthToken(token);
  const response = await axios.post(API_URL, eventData);
  return response.data;
};

const updateEvent = async (id, eventData, token) => {
  setAuthToken(token);
  const response = await axios.put(API_URL + id, eventData);
  return response.data;
};

const deleteEvent = async (id, token) => {
  setAuthToken(token);
  const response = await axios.delete(API_URL + id);
  return response.data;
};

const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

export default eventService;
