import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db';
// import userRoutes from './api/routes/user.routes';

// import other routes 
// import tutorRoutes from './api/routes/tutor.routes';
// import bookingRoutes from './api/routes/booking.routes';

dotenv.config(); // Load .env

const app: Application = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to DB
connectDB();

// Routes
// app.use('/api/users', userRoutes);
// app.use('/api/tutors', tutorRoutes);
// app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.send('Virtual Support API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
