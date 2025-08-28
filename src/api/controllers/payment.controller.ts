import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  createStripePaymentIntent,
  confirmStripePayment,
  processRefund,
  getPaymentById,
  getPayments,
  getPaymentStats,
  PaymentIntentData,
  RefundData
} from '../services/payment.service';

/**
 * Create Stripe payment intent
 */
export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (userRole !== 'student') {
      res.status(403).json({ message: 'Only students can create payments' });
      return;
    }

    const paymentData: PaymentIntentData = {
      sessionId: req.body.sessionId,
      studentId: userId,
      tutorId: req.body.tutorId,
      amount: req.body.amount,
      currency: req.body.currency || 'USD',
      description: req.body.description
    };

    const { paymentIntent, payment } = await createStripePaymentIntent(paymentData);
    
    res.status(201).json({
      message: 'Payment intent created successfully',
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      }
    });
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 
                      err.message.includes('already exists') ? 409 : 500;
    
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Confirm Stripe payment
 */
export const confirmPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      res.status(400).json({ message: 'Payment intent ID is required' });
      return;
    }

    const payment = await confirmStripePayment(paymentIntentId);
    
    res.status(200).json({
      message: 'Payment confirmed successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      }
    });
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Process refund
 */
export const refundPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Only tutors and admins can process refunds
    if (userRole !== 'tutor' && userRole !== 'admin') {
      res.status(403).json({ message: 'Insufficient permissions to process refunds' });
      return;
    }

    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: 'Payment ID is required' });
      return;
    }

    const refundData: RefundData = {
      paymentId: id,
      amount: req.body.amount,
      reason: req.body.reason
    };

    const payment = await processRefund(refundData);
    
    res.status(200).json({
      message: 'Refund processed successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        refundAmount: payment.refundAmount,
        refundReason: payment.refundReason
      }
    });
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 
                      err.message.includes('must be completed') ? 400 : 
                      err.message.includes('already been refunded') ? 400 : 500;
    
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get payment by ID
 */
export const getPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const paymentId = req.params.id;
    
    if (!paymentId) {
      res.status(400).json({ message: 'Payment ID is required' });
      return;
    }

    const payment = await getPaymentById(paymentId);
    
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    // Check if user has access to this payment
    if (userRole !== 'admin' && 
        payment.studentId.toString() !== userId && 
        payment.tutorId.toString() !== userId) {
      res.status(403).json({ message: 'Access denied to this payment' });
      return;
    }

    res.status(200).json({ payment });
  } catch (err: any) {
    const statusCode = err.message.includes('Invalid payment ID') ? 400 : 500;
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get payments with filters
 */
export const getPaymentsList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const filters: any = {};
    
    // Students can only see their own payments
    if (userRole === 'student') {
      filters.studentId = userId;
    }
    // Tutors can only see payments for their sessions
    else if (userRole === 'tutor') {
      filters.tutorId = userId;
    }
    // Admins can see all payments
    else if (userRole === 'admin') {
      if (req.query.studentId) filters.studentId = req.query.studentId as string;
      if (req.query.tutorId) filters.tutorId = req.query.tutorId as string;
    }

    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod as string;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    const payments = await getPayments(filters);
    
    res.status(200).json({
      payments,
      count: payments.length
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get payment statistics for authenticated user
 */
export const getMyPaymentStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const stats = await getPaymentStats(userId, userRole);
    
    res.status(200).json({ stats });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};
