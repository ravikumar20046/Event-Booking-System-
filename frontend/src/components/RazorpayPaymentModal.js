
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import bookingService from '../services/bookingService';
import { toast } from 'react-toastify';
import axios from 'axios';

const RazorpayPaymentModal = ({ show, handleClose, eventId, eventPrice, availableSeats, onSuccessfulBooking }) => {
    const [loading, setLoading] = useState(false);
    const [seatsBooked, setSeatsBooked] = useState(1); // Default to 1 seat
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const loadRazorpayScript = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            console.log('Razorpay SDK loaded');
        };
        script.onerror = () => {
            console.error('Failed to load Razorpay SDK');
            toast.error('Failed to load Razorpay SDK. Please try again.');
        };
        document.body.appendChild(script);
    };

    useEffect(() => {
        if (show) {
            loadRazorpayScript();
        }
    }, [show]);

    const displayRazorpay = async () => {
        setLoading(true);
        if (!process.env.REACT_APP_RAZORPAY_KEY_ID) {
            toast.error('Razorpay Key ID is not configured.');
            setLoading(false);
            return;
        }
        if (seatsBooked < 1) {
            toast.error('Please select at least 1 seat.');
            setLoading(false);
            return;
        }
        if (seatsBooked > availableSeats) {
            toast.error(`Only ${availableSeats} seats are available.`);
            setLoading(false);
            return;
        }

        try {
            const orderData = await bookingService.createRazorpayOrder(eventId, seatsBooked, token);

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Event Booking',
                description: 'Payment for event booking',
                order_id: orderData.id,
                handler: async (response) => {
                    try {
                        const verifyResponse = await bookingService.verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            eventId,
                        }, token);

                        if (verifyResponse.msg === 'Payment verified successfully') {
                            // Now create the booking in your backend
                            const createBookingResponse = await axios.post(
                                'http://localhost:5000/api/bookings',
                                {
                                    eventId,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    seatsBooked: seatsBooked,
                                },
                                {
                                    headers: {
                                        'x-auth-token': token,
                                    },
                                }
                            );

                            toast.success('Payment successful and booking created!');
                            handleClose();
                            onSuccessfulBooking();
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch (error) {
                        console.error('Payment verification or booking creation error:', error);
                        toast.error('Error during payment verification or booking creation.');
                    }
                },
                prefill: {
                    name: 'User Name', // You can prefill with user data
                    email: 'user@example.com',
                    contact: '9999999999',
                },
                theme: {
                    color: '#3399CC',
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            toast.error('Error creating payment order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Complete Your Payment</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <h5>Total Price: ₹{eventPrice * seatsBooked}</h5>
                <p>Click below to proceed with Razorpay payment.</p>
                <Form.Group className="mb-3">
                    <Form.Label>Number of Seats</Form.Label>
                    <Form.Control
                        type="number"
                        min="1"
                        max={availableSeats}
                        value={seatsBooked}
                        onChange={(e) => setSeatsBooked(isNaN(parseInt(e.target.value)) || parseInt(e.target.value) < 1 ? 1 : parseInt(e.target.value))}
                        disabled={loading}
                    />
                </Form.Group>
                <Button
                    variant="primary"
                    onClick={displayRazorpay}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Pay with Razorpay'}
                </Button>
            </Modal.Body>
        </Modal>
    );
};

export default RazorpayPaymentModal;

