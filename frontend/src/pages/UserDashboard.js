import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import RazorpayPaymentModal from '../components/RazorpayPaymentModal';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    price: '',
    location: '',
  });

  const fetchEvents = useCallback(async () => {
    try {
      const data = await eventService.getEvents();
      setEvents(data);
      setFilteredEvents(data);
    } catch (err) {
      setError(err.response.data.msg || 'Failed to fetch events');
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await bookingService.getUserBookings(token);
      setBookings(data);
    } catch (err) {
      setError(err.response.data.msg || 'Failed to fetch bookings');
    }
  }, []);

  const applyFilters = useCallback(() => {
    let tempEvents = [...events];

    if (filters.date) {
      tempEvents = tempEvents.filter(event => new Date(event.date).toDateString() === new Date(filters.date).toDateString());
    }
    if (filters.price) {
      tempEvents = tempEvents.filter(event => event.price <= parseFloat(filters.price));
    }
    if (filters.location) {
      tempEvents = tempEvents.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredEvents(tempEvents);
  }, [filters, events]);

  useEffect(() => {
    fetchEvents();
    fetchBookings();
  }, [fetchEvents, fetchBookings]); // Updated dependencies

  useEffect(() => {
    applyFilters();
  }, [filters, events, applyFilters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleBooking = (event) => {
    if (event.availableSeats === 0) {
      setError('No seats available for this event.');
      return;
    }
    setSelectedEvent(event);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => setShowPaymentModal(false);

  const handleSuccessfulBooking = () => {
    setMessage('Event booked successfully!');
    setShowPaymentModal(false);
    fetchEvents();
    fetchBookings();
  };

  return (
    <Container>
      <h1 className='my-4'>User Dashboard</h1>
      {error && <Alert variant='danger'>{error}</Alert>}
      {message && <Alert variant='success'>{message}</Alert>}

      <Row className='mb-4'>
        <Col>
          <h3>Filter Events</h3>
          <Form>
            <Row>
              <Col lg={4} md={6} sm={12}>
                <Form.Group className='mb-3'>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type='date'
                    name='date'
                    value={filters.date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col lg={4} md={6} sm={12}>
                <Form.Group className='mb-3'>
                  <Form.Label>Max Price</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='Max Price'
                    name='price'
                    value={filters.price}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col lg={4} md={6} sm={12}>
                <Form.Group className='mb-3'>
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Location'
                    name='location'
                    value={filters.location}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      <h3>Available Events</h3>
      <Row>
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <Col lg={4} md={6} sm={12} key={event._id} className='mb-4'>
              <Card className="shadow my-3" style={{ opacity: event.eventStatus === 'COMPLETED' ? 0.6 : 1 }}>
                <Card.Body>
                  <Card.Title>{event.name}
                    {event.eventStatus === 'COMPLETED' && (
                      <Badge bg="secondary" className="ms-2">Completed</Badge>
                    )}
                  </Card.Title>
                  <Card.Text>{event.description}</Card.Text>
                  <Card.Text><strong>Date:</strong> {new Date(event.date).toLocaleString()}</Card.Text>
                  <Card.Text><strong>Location:</strong> {event.location}</Card.Text>
                  <Card.Text><strong>Price:</strong> ${event.price}</Card.Text>
                  <Card.Text><strong>Available Seats:</strong> {event.availableSeats}</Card.Text>
                  <Button
                    variant='primary'
                    onClick={() => handleBooking(event)}
                    disabled={event.availableSeats === 0 || event.eventStatus === 'COMPLETED'}
                  >
                    {event.eventStatus === 'COMPLETED' ? 'Event Completed' : (event.availableSeats === 0 ? 'Sold Out' : 'Book Now')}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No events found.</p>
        )}
      </Row>

      <h3 className='my-4'>My Bookings</h3>
      <Row>
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <Col lg={4} md={6} sm={12} key={booking._id} className='mb-4'>
              <Card className="shadow my-3">
                  <Card.Body>
                    {booking.event ? (
                      <>
                        <Card.Title>{booking.event.name}</Card.Title>
                        <Card.Text><strong>Date:</strong> {new Date(booking.event.date).toLocaleString()}</Card.Text>
                        <Card.Text><strong>Location:</strong> {booking.event.location}</Card.Text>
                        <Card.Text><strong>Price:</strong> ${booking.event.price}</Card.Text>
                      </>
                    ) : (
                      <Card.Title>Event Details Not Available</Card.Title>
                    )}
                    <Card.Text><strong>Seats Booked:</strong> {booking.seatsBooked}</Card.Text>
                    <Card.Text><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleString()}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No bookings found.</p>
        )}
      </Row>

      {selectedEvent && (
        <RazorpayPaymentModal
          show={showPaymentModal}
          handleClose={handleClosePaymentModal}
          eventId={selectedEvent._id}
          eventPrice={selectedEvent.price}
          availableSeats={selectedEvent.availableSeats}
          onSuccessfulBooking={handleSuccessfulBooking}
        />
      )}
    </Container>
  );
};

export default UserDashboard;
