import { Router } from 'express';
import { authenticate, authorizeRole, authorizeRoles } from '../middlewares/auth.middleware';
import { validateRequest, paymentValidation } from '../middlewares/validation.middleware';
import {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getPayment,
  getPaymentsList,
  getMyPaymentStats
} from '../controllers/payment.controller';

const router = Router();

/**
 * @swagger
 * /api/payments/intent:
 *   post:
 *     summary: Create Stripe payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - tutorId
 *               - amount
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID of the session to pay for
 *               tutorId:
 *                 type: string
 *                 description: ID of the tutor
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Payment amount
 *               currency:
 *                 type: string
 *                 default: USD
 *                 enum: [USD, EUR, GBP, CAD, AUD]
 *               description:
 *                 type: string
 *                 description: Payment description
 *     responses:
 *       201:
 *         description: Payment intent created successfully
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a student
 *       404:
 *         description: Session not found
 *       409:
 *         description: Payment already exists for this session
 *       500:
 *         description: Server error
 */
router.post('/intent', 
  authenticate, 
  authorizeRole('student'),
  validateRequest(paymentValidation.createIntent),
  createPaymentIntent
);

/**
 * @swagger
 * /api/payments/confirm:
 *   post:
 *     summary: Confirm Stripe payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *                 description: Stripe payment intent ID
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       400:
 *         description: Bad request - payment intent ID required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment intent not found
 *       500:
 *         description: Server error
 */
router.post('/confirm', 
  authenticate,
  validateRequest(paymentValidation.confirm),
  confirmPayment
);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Process payment refund
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Refund amount (defaults to full payment amount)
 *               reason:
 *                 type: string
 *                 description: Reason for refund
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       400:
 *         description: Bad request - payment must be completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.post('/:id/refund', 
  authenticate,
  authorizeRoles(['tutor', 'admin']),
  validateRequest(paymentValidation.refund),
  refundPayment
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *       400:
 *         description: Bad request - invalid payment ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - access denied
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, getPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get payments with filters
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *         description: Filter by payment method
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID (admin only)
 *       - in: query
 *         name: tutorId
 *         schema:
 *           type: string
 *         description: Filter by tutor ID (admin only)
 *     responses:
 *       200:
 *         description: List of payments
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, getPaymentsList);

/**
 * @swagger
 * /api/payments/my/stats:
 *   get:
 *     summary: Get payment statistics for authenticated user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my/stats', authenticate, getMyPaymentStats);

export default router;
