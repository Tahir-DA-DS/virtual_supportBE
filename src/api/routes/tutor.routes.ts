import { Router } from 'express';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';
import { validateRequest, tutorValidation } from '../middlewares/validation.middleware';
import {
  createOrUpdateProfile,
  getProfile,
  getAllProfiles
} from '../controllers/tutor.controller';

const router = Router();

// Only authenticated tutors can create/update profile
router.post('/profile', 
  authenticate, 
  authorizeRole('tutor'), 
  validateRequest(tutorValidation.profile),
  createOrUpdateProfile
);

// Anyone can list all tutors (must come before parameterized route)
router.get('/all', getAllProfiles);

// Anyone can view tutor by ID (must come after specific routes)
router.get('/:id/profile', getProfile);

export default router;