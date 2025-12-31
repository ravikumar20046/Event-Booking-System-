import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { sendEmail } from './authController.js';

export const createBooking = async (req, res) => {
  console.log('createBooking: Received request.');
  console.log('createBooking: req.body:', req.body);
  console.log('createBooking: req.user:', req.user);
  const { eventId, razorpay_payment_id, seatsBooked } = req.body;
  const userId = req.user.id;

  try {
    console.log(`createBooking: Fetching event with ID: ${eventId}`);
    const event = await Event.findById(eventId);
    if (!event) {
      console.log('createBooking: Event not found.');
      return res.status(404).json({ msg: 'Event not found' });
    }
    console.log(`createBooking: Event found. Available Seats: ${event.availableSeats}`);

    if (seatsBooked < 1) {
        console.log('createBooking: Invalid seatsBooked - less than 1.');
        return res.status(400).json({ msg: 'Please select at least 1 seat.' });
    }

    if (seatsBooked > event.availableSeats) {
        console.log(`createBooking: Not enough available seats. Requested: ${seatsBooked}, Available: ${event.availableSeats}`);
        return res.status(400).json({ msg: `Only ${event.availableSeats} seats are available.` });
    }

    console.log(`createBooking: Decrementing available seats by ${seatsBooked}.`);
    event.availableSeats -= seatsBooked;
    await event.save();
    console.log(`createBooking: Event saved. New available seats: ${event.availableSeats}`);

    const newBooking = new Booking({
      event: eventId,
      user: userId,
      paymentId: razorpay_payment_id,
      price: event.price * seatsBooked,
      seatsBooked: seatsBooked
    });
    console.log('createBooking: New booking object created:', newBooking);

    const booking = await newBooking.save();
    console.log('createBooking: Booking saved successfully:', booking);

    // Send booking confirmation email
    const user = await User.findById(userId);
    if (user && user.email) {
        const subject = `Booking Confirmation for ${event.name}`;
        const text = `Dear ${user.name},\n\nYour booking for the event "${event.name}" on ${new Date(event.date).toLocaleDateString()} at ${event.location} for ${seatsBooked} seat(s) has been confirmed.\n\nTotal Price: Rs.${event.price * seatsBooked}\nPayment ID: ${razorpay_payment_id}\n\nWe look forward to seeing you there!`;
        await sendEmail(user.email, subject, text);
        console.log(`createBooking: Confirmation email sent to ${user.email}`);
    }

    res.json(booking);

  } catch (err) {
    console.error('createBooking: Error:', err);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/bookings
// @desc    Get all bookings for a user
// @access  Private (User only)
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('event', [
      'name','date', 'location', 'price',
    ]);
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/bookings/admin
// @desc    Get all bookings (Admin only)
// @access  Private (Admin only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('event', [
      'name', 'date', 'location', 'price',
    ]).populate('user', ['name', 'email']);
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Increment available seats for the event
    const event = await Event.findById(booking.event);
    if (event) {
      event.availableSeats += booking.seatsBooked;
      await event.save();
    }

    await Booking.deleteOne({ _id: req.params.id });

    res.json({ msg: 'Booking removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.status(500).send('Server Error');
  }
};