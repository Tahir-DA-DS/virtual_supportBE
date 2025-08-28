"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyPaymentStats = exports.getPaymentsList = exports.getPayment = exports.refundPayment = exports.confirmPayment = exports.createPaymentIntent = void 0;
const payment_service_1 = require("../services/payment.service");
/**
 * Create Stripe payment intent
 */
const createPaymentIntent = async (req, res) => {
    try {
        const authReq = req;
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
        const paymentData = {
            sessionId: req.body.sessionId,
            studentId: userId,
            tutorId: req.body.tutorId,
            amount: req.body.amount,
            currency: req.body.currency || 'USD',
            description: req.body.description
        };
        const { paymentIntent, payment } = await (0, payment_service_1.createStripePaymentIntent)(paymentData);
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
    }
    catch (err) {
        const statusCode = err.message.includes('not found') ? 404 :
            err.message.includes('already exists') ? 409 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.createPaymentIntent = createPaymentIntent;
/**
 * Confirm Stripe payment
 */
const confirmPayment = async (req, res) => {
    try {
        const authReq = req;
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
        const payment = await (0, payment_service_1.confirmStripePayment)(paymentIntentId);
        res.status(200).json({
            message: 'Payment confirmed successfully',
            payment: {
                id: payment._id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency
            }
        });
    }
    catch (err) {
        const statusCode = err.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.confirmPayment = confirmPayment;
/**
 * Process refund
 */
const refundPayment = async (req, res) => {
    try {
        const authReq = req;
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
        const refundData = {
            paymentId: id,
            amount: req.body.amount,
            reason: req.body.reason
        };
        const payment = await (0, payment_service_1.processRefund)(refundData);
        res.status(200).json({
            message: 'Refund processed successfully',
            payment: {
                id: payment._id,
                status: payment.status,
                refundAmount: payment.refundAmount,
                refundReason: payment.refundReason
            }
        });
    }
    catch (err) {
        const statusCode = err.message.includes('not found') ? 404 :
            err.message.includes('must be completed') ? 400 :
                err.message.includes('already been refunded') ? 400 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.refundPayment = refundPayment;
/**
 * Get payment by ID
 */
const getPayment = async (req, res) => {
    try {
        const authReq = req;
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
        const payment = await (0, payment_service_1.getPaymentById)(paymentId);
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
    }
    catch (err) {
        const statusCode = err.message.includes('Invalid payment ID') ? 400 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getPayment = getPayment;
/**
 * Get payments with filters
 */
const getPaymentsList = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        const userRole = authReq.user?.role;
        if (!userId || !userRole) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const filters = {};
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
            if (req.query.studentId)
                filters.studentId = req.query.studentId;
            if (req.query.tutorId)
                filters.tutorId = req.query.tutorId;
        }
        if (req.query.status)
            filters.status = req.query.status;
        if (req.query.paymentMethod)
            filters.paymentMethod = req.query.paymentMethod;
        if (req.query.startDate)
            filters.startDate = new Date(req.query.startDate);
        if (req.query.endDate)
            filters.endDate = new Date(req.query.endDate);
        const payments = await (0, payment_service_1.getPayments)(filters);
        res.status(200).json({
            payments,
            count: payments.length
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getPaymentsList = getPaymentsList;
/**
 * Get payment statistics for authenticated user
 */
const getMyPaymentStats = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        const userRole = authReq.user?.role;
        if (!userId || !userRole) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const stats = await (0, payment_service_1.getPaymentStats)(userId, userRole);
        res.status(200).json({ stats });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getMyPaymentStats = getMyPaymentStats;
//# sourceMappingURL=payment.controller.js.map