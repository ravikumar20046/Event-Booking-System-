import React, { useState, useEffect } from 'react';
import { Container, Button, Table, Alert, Badge, Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import eventService from '../services/eventService';
const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await eventService.getEvents(token);
      setEvents(data);
    } catch (err) {
      setError(err.response.data.msg || 'Failed to fetch events');
    }
  };

  const handleDelete = async (id) => {
    console.log('Attempting to delete event with ID:', id);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found. User not authenticated.');
        setError('You must be logged in to delete events.');
        return;
      }
      await eventService.deleteEvent(id, token);
      setMessage('Event deleted successfully');
      fetchEvents();
      console.log('Event deleted successfully, fetching updated events.');
    } catch (err) {
      console.error('Error deleting event:', err.response ? err.response.data : err.message);
      setError(err.response.data.msg || 'Failed to delete event');
    }
  };

  return (
    <Container>
      <h1 className='my-4'>Admin Dashboard</h1>
      {error && <Alert variant='danger'>{error}</Alert>}
      {message && <Alert variant='success'>{message}</Alert>}
      <Row className="mb-3">
        <Col>
          <LinkContainer to='/admin/events/new'>
            <Button variant='primary'>
              ➕ Add Event
            </Button>
          </LinkContainer>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Location</th>
            <th>Price</th>
            <th>Total Seats</th>
            <th>Available Seats</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event._id}>
              <td>{event.name}
                {event.eventStatus === 'COMPLETED' && (
                  <Badge bg="secondary" className="ms-2">Completed</Badge>
                )}
              </td>
              <td>{new Date(event.date).toLocaleString()}</td>
              <td>{event.location}</td>
              <td>${event.price}</td>
              <td>{event.totalSeats}</td>
              <td>{event.availableSeats}</td>
              <td>
                <Badge bg={event.eventStatus === 'COMPLETED' ? 'secondary' : 'success'}>
                  {event.eventStatus}
                </Badge>
              </td>
              <td>
                <LinkContainer to={`/admin/events/edit/${event._id}`}>
                  <Button
                    variant='info'
                    size='sm'
                    className='me-2'
                  >
                    ✏️ Edit
                  </Button>
                </LinkContainer>
                <Button
                  variant='danger'
                  size='sm'
                  onClick={() => handleDelete(event._id)}
                >
                  🗑️ Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminDashboard;
