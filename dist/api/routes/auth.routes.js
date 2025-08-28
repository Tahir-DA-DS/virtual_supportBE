"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [student, tutor]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request - validation failed
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/register', (0, validation_middleware_1.validateRequest)(validation_middleware_1.authValidation.register), auth_controller_1.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', (0, validation_middleware_1.validateRequest)(validation_middleware_1.authValidation.login), auth_controller_1.login);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Server error
 */
router.post('/logout', auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map