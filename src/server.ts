import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { setupSwagger } from './utils/swagger';
import { connectDB } from './config/db';
import { requestLogger, errorLogger } from './utils/logger';
import { handleError } from './utils/errorHandler';
import authRoutes from './api/routes/auth.routes';
import tutorRoutes from './api/routes/tutor.routes';
import sessionRoutes from './api/routes/session.routes';
import paymentRoutes from './api/routes/payment.routes';
import chatRoutes from './api/routes/chat.routes';
import userRoutes from './api/routes/user.routes';

// Load environment variables first
dotenv.config();

// Validate required environment variables only in non-test environments
if (process.env.NODE_ENV !== 'test') {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
}

const app = express();

// Middleware
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || true, 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Connect to DB only in non-test environments
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Virtual Support API is running...',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API documentation
setupSwagger(app);

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: any) => {
  const errorInfo = handleError(err);
  
  res.status(errorInfo.statusCode).json({ 
    message: errorInfo.message,
    ...(errorInfo.errors && { errors: errorInfo.errors }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: errorInfo
    })
  });
});

// 404 handler - catch all unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Export app for testing
export { app };

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
}
