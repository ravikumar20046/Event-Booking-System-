import Event from '../models/Event.js';

// Helper function to update event status
const updateEventStatus = async (event) => {
  const now = new Date();
  if (event.date < now && event.eventStatus === 'UPCOMING') {
    event.eventStatus = 'COMPLETED';
    await event.save();
  }
  return event;
};

// @route   GET api/events
// @desc    Get all events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    let events = await Event.find().sort({ date: 1 });

    // Update status for each event
    events = await Promise.all(events.map(updateEventStatus));

    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
export const getEventById = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Update status for the single event
    event = await updateEventStatus(event);

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/events
// @desc    Create an event
// @access  Private (Admin only)
export const createEvent = async (req, res) => {
  const { name, description, date, location, price, totalSeats } = req.body;

  try {
    const newEvent = new Event({
      name,
      description,
      date,
      location,
      price,
      totalSeats,
      availableSeats: totalSeats,
      organizer: req.user.id,
    });

    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Admin only)
export const updateEvent = async (req, res) => {
  const { name, description, date, location, price, totalSeats } = req.body;

  // Build event object
  const eventFields = {};
  if (name) eventFields.name = name;
  if (description) eventFields.description = description;
  if (date) eventFields.date = date;
  if (location) eventFields.location = location;
  if (price) eventFields.price = price;
  if (totalSeats) {
    const event = await Event.findById(req.params.id);
    if (event) {
      const bookedSeats = event.totalSeats - event.availableSeats;
      if (totalSeats < bookedSeats) {
        return res.status(400).json({ msg: 'Total seats cannot be less than booked seats' });
      }
      eventFields.totalSeats = totalSeats;
      eventFields.availableSeats = totalSeats - bookedSeats;
    }
  }

  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Event not found' });

    // Ensure user is organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: eventFields },
      { new: true }
    );

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Admin only)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Ensure user is organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Event.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
