import { Router } from 'express';
const router = Router();
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', getEvents);

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', getEventById);

// @route   POST api/events
// @desc    Create an event
// @access  Private (Admin only)
router.post('/', auth, authorizeRoles('ADMIN'), createEvent);

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Admin only)
router.put('/:id', auth, authorizeRoles('ADMIN'), updateEvent);

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Admin only)
router.delete('/:id', auth, authorizeRoles('ADMIN'), deleteEvent);

export default router;
