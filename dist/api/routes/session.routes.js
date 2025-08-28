"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const session_controller_1 = require("../controllers/session.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorId
 *               - subject
 *               - startTime
 *               - duration
 *               - price
 *             properties:
 *               tutorId:
 *                 type: string
 *                 description: ID of the tutor
 *               subject:
 *                 type: string
 *                 description: Subject to be taught
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Session start time
 *               duration:
 *                 type: number
 *                 minimum: 15
 *                 maximum: 480
 *                 description: Duration in minutes
 *               sessionType:
 *                 type: string
 *                 enum: [one-on-one, group, exam-prep, homework-help]
 *                 default: one-on-one
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Session price
 *               currency:
 *                 type: string
 *                 default: USD
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Session created successfully
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a student
 *       409:
 *         description: Scheduling conflict
 *       500:
 *         description: Server error
 */
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)('student'), (0, validation_middleware_1.validateRequest)(validation_middleware_1.sessionValidation.create), session_controller_1.createNewSession);
/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session details
 *       400:
 *         description: Bad request - invalid session ID
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.get('/:id', session_controller_1.getSession);
/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Update session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *                 minimum: 15
 *                 maximum: 480
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled, no-show]
 *               notes:
 *                 type: string
 *               meetingLink:
 *                 type: string
 *               recordingUrl:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Session not found
 *       409:
 *         description: Scheduling conflict
 *       500:
 *         description: Server error
 */
router.put('/:id', auth_middleware_1.authenticate, (0, validation_middleware_1.validateRequest)(validation_middleware_1.sessionValidation.update), session_controller_1.updateSessionDetails);
/**
 * @swagger
 * /api/sessions/{id}/cancel:
 *   post:
 *     summary: Cancel session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session cancelled successfully
 *       400:
 *         description: Bad request - cannot cancel
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.post('/:id/cancel', auth_middleware_1.authenticate, session_controller_1.cancelSessionById);
/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get sessions with filters
 *     tags: [Sessions]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: tutorId
 *         schema:
 *           type: string
 *         description: Filter by tutor ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject
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
 *     responses:
 *       200:
 *         description: List of sessions
 *       500:
 *         description: Server error
 */
router.get('/', session_controller_1.getSessionsList);
/**
 * @swagger
 * /api/sessions/my/upcoming:
 *   get:
 *     summary: Get upcoming sessions for authenticated user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming sessions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my/upcoming', auth_middleware_1.authenticate, session_controller_1.getMyUpcomingSessions);
/**
 * @swagger
 * /api/sessions/my/stats:
 *   get:
 *     summary: Get session statistics for authenticated user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session statistics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my/stats', auth_middleware_1.authenticate, session_controller_1.getMySessionStats);
exports.default = router;
//# sourceMappingURL=session.routes.js.map