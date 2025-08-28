import Payment, { IPayment } from '../models/payment.model';
import Session from '../models/session.model';
import User from '../models/User';
import Stripe from 'stripe';

// Initialize Stripe only if API key is available
let stripe: Stripe | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    });
  }
} catch (error) {
  console.warn('Stripe initialization failed:', error);
}

export interface CreatePaymentData {
  sessionId: string;
  studentId: string;
  tutorId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer';
  description?: string;
}

export interface PaymentIntentData {
  amount: number;
  currency: string;
  sessionId: string;
  studentId: string;
  tutorId: string;
  description?: string;
}

export interface RefundData {
  paymentId: string;
  amount?: number;
  reason?: string;
}

/**
 * Create a payment record
 */
export const createPayment = async (data: CreatePaymentData): Promise<IPayment> => {
  // Validate that the session exists
  const session = await Session.findById(data.sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  // Validate that both users exist
  const [student, tutor] = await Promise.all([
    User.findById(data.studentId),
    User.findById(data.tutorId)
  ]);

  if (!student) {
    throw new Error('Student not found');
  }

  if (!tutor) {
    throw new Error('Tutor not found');
  }

  // Check if payment already exists for this session
  const existingPayment = await Payment.findOne({ sessionId: data.sessionId });
  if (existingPayment) {
    throw new Error('Payment already exists for this session');
  }

  // Create the payment record
  const payment = new Payment({
    ...data,
    currency: data.currency || 'USD',
    description: data.description || `Payment for ${session.subject} session`,
    metadata: {
      sessionSubject: session.subject,
      sessionDuration: session.duration,
      sessionType: session.sessionType
    }
  });

  return await payment.save();
};

/**
 * Create Stripe payment intent
 */
export const createStripePaymentIntent = async (data: PaymentIntentData): Promise<{
  paymentIntent: Stripe.PaymentIntent;
  payment: IPayment;
}> => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  // Create payment record first
  const payment = await createPayment({
    sessionId: data.sessionId,
    studentId: data.studentId,
    tutorId: data.tutorId,
    amount: data.amount,
    currency: data.currency,
    paymentMethod: 'stripe',
    description: data.description
  });

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(data.amount * 100), // Convert to cents
    currency: data.currency.toLowerCase(),
    metadata: {
      paymentId: payment._id?.toString() || '',
      sessionId: data.sessionId,
      studentId: data.studentId,
      tutorId: data.tutorId
    },
    description: data.description || `Payment for session ${data.sessionId}`,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Update payment record with Stripe payment intent ID
  payment.stripePaymentIntentId = paymentIntent.id;
  payment.status = 'pending';
  await payment.save();

  return { paymentIntent, payment };
};

/**
 * Confirm Stripe payment
 */
export const confirmStripePayment = async (paymentIntentId: string): Promise<IPayment> => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  // Retrieve payment intent from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (!paymentIntent) {
    throw new Error('Payment intent not found');
  }

  // Find payment record
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
  if (!payment) {
    throw new Error('Payment record not found');
  }

  // Update payment status based on Stripe status
  switch (paymentIntent.status) {
    case 'succeeded':
      payment.status = 'completed';
      payment.stripeChargeId = paymentIntent.latest_charge as string;
      break;
    case 'processing':
      payment.status = 'processing';
      break;
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      payment.status = 'pending';
      break;
    case 'canceled':
      payment.status = 'cancelled';
      break;
    default:
      payment.status = 'failed';
      payment.failureReason = 'Payment failed';
      payment.failureCode = paymentIntent.status;
  }

  return await payment.save();
};

/**
 * Process Stripe webhook
 */
export const processStripeWebhook = async (event: Stripe.Event): Promise<void> => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

/**
 * Handle successful payment intent
 */
const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
  if (payment) {
    payment.status = 'completed';
    payment.stripeChargeId = paymentIntent.latest_charge as string;
    await payment.save();
  }
};

/**
 * Handle failed payment intent
 */
const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
  if (payment) {
    payment.status = 'failed';
    payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
    payment.failureCode = paymentIntent.status;
    await payment.save();
  }
};

/**
 * Handle charge refund
 */
const handleChargeRefunded = async (charge: Stripe.Charge): Promise<void> => {
  const payment = await Payment.findOne({ stripeChargeId: charge.id });
  if (payment) {
    payment.status = 'refunded';
    payment.refundAmount = charge.amount_refunded / 100; // Convert from cents
    payment.refundedAt = new Date();
    await payment.save();
  }
};

/**
 * Process refund
 */
export const processRefund = async (data: RefundData): Promise<IPayment> => {
  const payment = await Payment.findById(data.paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'completed') {
    throw new Error('Only completed payments can be refunded');
  }

  const refundAmount = data.amount || payment.amount;

  if (refundAmount > payment.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }

  // Process Stripe refund if applicable
  if (payment.stripeChargeId && stripe) {
    try {
      await stripe.refunds.create({
        charge: payment.stripeChargeId,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: data.reason ? 'requested_by_customer' : 'duplicate',
        metadata: {
          paymentId: payment._id?.toString() || '',
          reason: data.reason || 'No reason provided'
        }
      });

      payment.status = 'refunded';
      payment.refundAmount = refundAmount;
      payment.refundReason = data.reason;
      payment.refundedAt = new Date();
    } catch (error: any) {
      throw new Error(`Stripe refund failed: ${error.message}`);
    }
  } else {
    // Manual refund for non-Stripe payments
    payment.status = 'refunded';
    payment.refundAmount = refundAmount;
    payment.refundReason = data.reason;
    payment.refundedAt = new Date();
  }

  return await payment.save();
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId: string): Promise<IPayment | null> => {
  if (!paymentId || !paymentId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('Invalid payment ID');
  }

  return await Payment.findById(paymentId)
    .populate('sessionId', 'subject startTime duration')
    .populate('studentId', 'name email')
    .populate('tutorId', 'name email');
};

/**
 * Get payments with filters
 */
export const getPayments = async (filters: {
  studentId?: string;
  tutorId?: string;
  status?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<IPayment[]> => {
  const query: any = {};

  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.tutorId) query.tutorId = filters.tutorId;
  if (filters.status) query.status = filters.status;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = filters.startDate;
    if (filters.endDate) query.createdAt.$lte = filters.endDate;
  }

  return await Payment.find(query)
    .populate('sessionId', 'subject startTime duration')
    .populate('studentId', 'name email')
    .populate('tutorId', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Get payment statistics
 */
export const getPaymentStats = async (userId: string, userRole: string): Promise<any> => {
  const matchStage: any = {};

  if (userRole === 'student') {
    matchStage.studentId = userId;
  } else if (userRole === 'tutor') {
    matchStage.tutorId = userId;
  }

  const stats = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);

  return stats.reduce((acc: any, stat: any) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount,
      avgAmount: stat.avgAmount
    };
    return acc;
  }, {});
};
