import { Router } from 'express';
const router = Router();
import { getUserBookings, getAllBookings, createBooking } from '../controllers/bookingController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/razorpayController.js';

// @route   POST api/bookings/razorpay/create-order/:eventId
// @desc    Create a Razorpay order
// @access  Private (User only)
router.post('/razorpay/create-order/:eventId', auth, authorizeRoles('USER'), createRazorpayOrder);

// @route   POST api/bookings/razorpay/verify-payment
// @desc    Verify Razorpay payment and create booking
// @access  Private (User only)
router.post('/razorpay/verify-payment', auth, authorizeRoles('USER'), verifyRazorpayPayment);

// @route   POST api/bookings
// @desc    Create a new booking after payment verification
// @access  Private (User only)
router.post('/', auth, authorizeRoles('USER'), createBooking);

// @route   GET api/bookings/me
// @desc    Get all bookings for a user
// @access  Private (User only)
router.get('/me', auth, authorizeRoles('USER'), getUserBookings);

// @route   GET api/bookings/admin
// @desc    Get all bookings (Admin only)
// @access  Private (Admin only)
router.get('/admin', auth, authorizeRoles('ADMIN'), getAllBookings);

export default router;
