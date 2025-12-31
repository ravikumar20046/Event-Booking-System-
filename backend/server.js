import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import cron from 'node-cron';
import Booking from './models/Booking.js';
import Event from './models/Event.js';
import { sendEmail } from './controllers/authController.js';

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import bookingRoutes from './routes/bookings.js';

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Cron Job for Event Reminders
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);

    // Find events starting in the next 30 minutes
    const events = await Event.find({
      date: { $gt: now, $lte: thirtyMinutesLater }
    });

    if (events.length > 0) {
      const eventIds = events.map(e => e._id);
      
      // Find bookings for these events where reminder hasn't been sent
      const bookings = await Booking.find({
        event: { $in: eventIds },
        reminderSent: false
      }).populate('user').populate('event');

      for (const booking of bookings) {
        if (booking.user && booking.user.email) {
          const subject = `Reminder: ${booking.event.name} starts in 30 minutes!`;
          const text = `Dear ${booking.user.name},\n\nThis is a friendly reminder that your event "${booking.event.name}" is starting soon at ${new Date(booking.event.date).toLocaleTimeString()}.\n\nLocation: ${booking.event.location}\n\nWe look forward to seeing you there!`;
          
          await sendEmail(booking.user.email, subject, text);
          
          booking.reminderSent = true;
          await booking.save();
        }
      }
    }
  } catch (err) {
    console.error('Error in reminder cron job:', err);
  }
});

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
