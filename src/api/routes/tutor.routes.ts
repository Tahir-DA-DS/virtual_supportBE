import { Router } from 'express';
import {
  createOrUpdateProfile,
  getProfile,
  getAllProfiles
} from '../controllers/tutor.controller';

const router = Router();

router.post('/profile', createOrUpdateProfile);         // Create or Update
router.get('/:id/profile', getProfile);                 // Get by ID
router.get('/all', getAllProfiles);                     // List all

export default router;