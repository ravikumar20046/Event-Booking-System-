import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  eventStatus: {
    type: String,
    enum: ['UPCOMING', 'COMPLETED'],
    default: 'UPCOMING',
  },
});

export default mongoose.model('Event', EventSchema);
