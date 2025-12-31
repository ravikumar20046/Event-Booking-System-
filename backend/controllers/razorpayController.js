
import Razorpay from 'razorpay';
import Event from '../models/Event.js';
import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log('Razorpay initialized with Key ID:', process.env.RAZORPAY_KEY_ID);
console.log('Razorpay initialized with Key Secret:', process.env.RAZORPAY_KEY_SECRET ? '********' : 'UNDEFINED'); // Masking secret for security

export const createRazorpayOrder = async (req, res) => {
    console.log('Received request to create Razorpay order');
    const { eventId } = req.params;
    const { seatsBooked } = req.body;
    const userId = req.user.id;
    console.log('createRazorpayOrder: req.user:', req.user);

    try {
        console.log(`Fetching event with ID: ${eventId}`);
        const event = await Event.findById(eventId);
        if (!event) {
            console.log('Event not found');
            return res.status(404).json({ msg: 'Event not found' });
        }
        console.log(`Event found: ${event.name}, Price: ${event.price}, Available Seats: ${event.availableSeats}`);

        if (seatsBooked < 1) {
            return res.status(400).json({ msg: 'Please select at least 1 seat.' });
        }

        if (seatsBooked > event.availableSeats) {
            return res.status(400).json({ msg: `Only ${event.availableSeats} seats are available.` });
        }

        const options = {
            amount: event.price * seatsBooked * 100, // amount in smallest currency unit, multiplied by seats
            currency: 'INR',
            receipt: `rcpt_${userId.slice(-8)}_${eventId.slice(-8)}`, // Shortened to fit Razorpay's 40-char limit
            payment_capture: 1
        };
        console.log('Razorpay order options:', options);

        const order = await razorpay.orders.create(options);
        console.log('Razorpay order created:', order);
        res.json(order);

    } catch (err) {
        console.error('Error in createRazorpayOrder:', err); // Log the entire error object
        res.status(500).send('Server Error');
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        eventId
    } = req.body;

    try {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is successful, now create the booking
            // This part will be handled in bookingController.js
            res.json({ msg: 'Payment verified successfully', razorpay_payment_id });
        } else {
            res.status(400).json({ msg: 'Invalid signature' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

