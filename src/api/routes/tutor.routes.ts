import { Router } from 'express';
import {
  createOrUpdateProfile,
  getProfile,
  getAllProfiles
} from '../controllers/tutor.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tutors
 *   description: Tutor Profile Management
 */

/**
 * @swagger
 * /api/tutors/profile:
 *   post:
 *     summary: Create or update a tutor profile
 *     tags: [Tutors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *               - email
 *             properties:
 *               userId:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               availability:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tutor profile created or updated
 *       500:
 *         description: Server error
 */
router.post('/profile', createOrUpdateProfile);

/**
 * @swagger
 * /api/tutors/{id}/profile:
 *   get:
 *     summary: Get a tutor profile by ID
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Tutor ID
 *     responses:
 *       200:
 *         description: Tutor profile retrieved
 *       404:
 *         description: Tutor not found
 */
router.get('/:id/profile', getProfile);

/**
 * @swagger
 * /api/tutors/all:
 *   get:
 *     summary: Get all tutor profiles
 *     tags: [Tutors]
 *     responses:
 *       200:
 *         description: List of tutors
 */
router.get('/all', getAllProfiles);

export default router;