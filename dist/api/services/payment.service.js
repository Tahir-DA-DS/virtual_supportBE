"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStats = exports.getPayments = exports.getPaymentById = exports.processRefund = exports.processStripeWebhook = exports.confirmStripePayment = exports.createStripePaymentIntent = exports.createPayment = void 0;
const payment_model_1 = __importDefault(require("../models/payment.model"));
const session_model_1 = __importDefault(require("../models/session.model"));
const User_1 = __importDefault(require("../models/User"));
const stripe_1 = __importDefault(require("stripe"));
// Initialize Stripe only if API key is available
let stripe = null;
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-07-30.basil',
        });
    }
}
catch (error) {
    console.warn('Stripe initialization failed:', error);
}
/**
 * Create a payment record
 */
const createPayment = async (data) => {
    // Validate that the session exists
    const session = await session_model_1.default.findById(data.sessionId);
    if (!session) {
        throw new Error('Session not found');
    }
    // Validate that both users exist
    const [student, tutor] = await Promise.all([
        User_1.default.findById(data.studentId),
        User_1.default.findById(data.tutorId)
    ]);
    if (!student) {
        throw new Error('Student not found');
    }
    if (!tutor) {
        throw new Error('Tutor not found');
    }
    // Check if payment already exists for this session
    const existingPayment = await payment_model_1.default.findOne({ sessionId: data.sessionId });
    if (existingPayment) {
        throw new Error('Payment already exists for this session');
    }
    // Create the payment record
    const payment = new payment_model_1.default({
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
exports.createPayment = createPayment;
/**
 * Create Stripe payment intent
 */
const createStripePaymentIntent = async (data) => {
    if (!stripe) {
        throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    // Create payment record first
    const payment = await (0, exports.createPayment)({
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
exports.createStripePaymentIntent = createStripePaymentIntent;
/**
 * Confirm Stripe payment
 */
const confirmStripePayment = async (paymentIntentId) => {
    if (!stripe) {
        throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) {
        throw new Error('Payment intent not found');
    }
    // Find payment record
    const payment = await payment_model_1.default.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
        throw new Error('Payment record not found');
    }
    // Update payment status based on Stripe status
    switch (paymentIntent.status) {
        case 'succeeded':
            payment.status = 'completed';
            payment.stripeChargeId = paymentIntent.latest_charge;
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
exports.confirmStripePayment = confirmStripePayment;
/**
 * Process Stripe webhook
 */
const processStripeWebhook = async (event) => {
    if (!stripe) {
        throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentIntentSucceeded(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentIntentFailed(event.data.object);
            break;
        case 'charge.refunded':
            await handleChargeRefunded(event.data.object);
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
};
exports.processStripeWebhook = processStripeWebhook;
/**
 * Handle successful payment intent
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
    const payment = await payment_model_1.default.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (payment) {
        payment.status = 'completed';
        payment.stripeChargeId = paymentIntent.latest_charge;
        await payment.save();
    }
};
/**
 * Handle failed payment intent
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
    const payment = await payment_model_1.default.findOne({ stripePaymentIntentId: paymentIntent.id });
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
const handleChargeRefunded = async (charge) => {
    const payment = await payment_model_1.default.findOne({ stripeChargeId: charge.id });
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
const processRefund = async (data) => {
    const payment = await payment_model_1.default.findById(data.paymentId);
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
        }
        catch (error) {
            throw new Error(`Stripe refund failed: ${error.message}`);
        }
    }
    else {
        // Manual refund for non-Stripe payments
        payment.status = 'refunded';
        payment.refundAmount = refundAmount;
        payment.refundReason = data.reason;
        payment.refundedAt = new Date();
    }
    return await payment.save();
};
exports.processRefund = processRefund;
/**
 * Get payment by ID
 */
const getPaymentById = async (paymentId) => {
    if (!paymentId || !paymentId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid payment ID');
    }
    return await payment_model_1.default.findById(paymentId)
        .populate('sessionId', 'subject startTime duration')
        .populate('studentId', 'name email')
        .populate('tutorId', 'name email');
};
exports.getPaymentById = getPaymentById;
/**
 * Get payments with filters
 */
const getPayments = async (filters) => {
    const query = {};
    if (filters.studentId)
        query.studentId = filters.studentId;
    if (filters.tutorId)
        query.tutorId = filters.tutorId;
    if (filters.status)
        query.status = filters.status;
    if (filters.paymentMethod)
        query.paymentMethod = filters.paymentMethod;
    if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate)
            query.createdAt.$gte = filters.startDate;
        if (filters.endDate)
            query.createdAt.$lte = filters.endDate;
    }
    return await payment_model_1.default.find(query)
        .populate('sessionId', 'subject startTime duration')
        .populate('studentId', 'name email')
        .populate('tutorId', 'name email')
        .sort({ createdAt: -1 });
};
exports.getPayments = getPayments;
/**
 * Get payment statistics
 */
const getPaymentStats = async (userId, userRole) => {
    const matchStage = {};
    if (userRole === 'student') {
        matchStage.studentId = userId;
    }
    else if (userRole === 'tutor') {
        matchStage.tutorId = userId;
    }
    const stats = await payment_model_1.default.aggregate([
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
    return stats.reduce((acc, stat) => {
        acc[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount,
            avgAmount: stat.avgAmount
        };
        return acc;
    }, {});
};
exports.getPaymentStats = getPaymentStats;
//# sourceMappingURL=payment.service.js.map