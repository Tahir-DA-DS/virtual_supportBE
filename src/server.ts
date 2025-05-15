import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { setupSwagger } from './utils/swagger';

// After app definition and middlewares

import { connectDB } from './config/db';
import authRoutes from './api/routes/auth.routes';
import tutorRoutes from './api/routes/tutor.routes';

// import other routes 
// import tutorRoutes from './api/routes/tutor.routes';
// import bookingRoutes from './api/routes/booking.routes';

dotenv.config(); // Load .env

const app: Express = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
// app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/', (_req: Request, res: Response) => {
    res.send('Virtual Support API is running...');
});

setupSwagger(app);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
