import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import eventService from '../services/eventService';

const EventForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    price: '',
    totalSeats: '',
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing event

  const { name, description, date, location, price, totalSeats } = formData;

  useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id]);

  const fetchEvent = async (eventId) => {
    try {
      const event = await eventService.getEventById(eventId);
      setFormData({
        name: event.name,
        description: event.description,
        date: new Date(event.date).toISOString().slice(0, 16), // Format for datetime-local input
        location: event.location,
        price: event.price,
        totalSeats: event.totalSeats,
      });
    } catch (err) {
      setError(err.response.data.msg || 'Failed to fetch event for editing');
    }
  };

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (id) {
        await eventService.updateEvent(id, formData, token);
        setMessage('Event updated successfully!');
      } else {
        await eventService.createEvent(formData, token);
        setMessage('Event created successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response.data.msg || 'Operation failed');
    }
  };

  return (
    <Container>
      <h1 className='my-4'>{id ? 'Edit Event' : 'Add Event'}</h1>
      {error && <Alert variant='danger'>{error}</Alert>}
      {message && <Alert variant='success'>{message}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group className='mb-3'>
          <Form.Label>Event Name</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter event name'
            name='name'
            value={name}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as='textarea'
            rows={3}
            placeholder='Enter description'
            name='description'
            value={description}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Date & Time</Form.Label>
          <Form.Control
            type='datetime-local'
            name='date'
            value={date}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Location</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter location'
            name='location'
            value={location}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Price</Form.Label>
          <Form.Control
            type='number'
            placeholder='Enter price'
            name='price'
            value={price}
            onChange={onChange}
            required
            min='0'
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Total Seats</Form.Label>
          <Form.Control
            type='number'
            placeholder='Enter total seats'
            name='totalSeats'
            value={totalSeats}
            onChange={onChange}
            required
            min='1'
          />
        </Form.Group>

        <Button variant='primary' type='submit'>
          {id ? 'Update Event' : 'Create Event'}
        </Button>
      </Form>
    </Container>
  );
};

export default EventForm;
