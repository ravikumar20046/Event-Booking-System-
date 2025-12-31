import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seatsBooked: {
    type: Number,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Booking', BookingSchema);
