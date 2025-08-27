import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  createOrUpdateTutor,
  getTutorById,
  getAllTutors
} from '../services/tutor.service';

export const createOrUpdateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: missing userId' });
      return;
    }

    const data = req.body;
    const tutor = await createOrUpdateTutor(userId, data);
    
    res.status(200).json({ 
      message: 'Profile saved successfully', 
      tutor 
    });
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tutorId = req.params.id;
    const tutor = await getTutorById(tutorId);
    
    if (!tutor) {
      res.status(404).json({ message: 'Tutor not found' });
      return;
    }
    
    res.status(200).json({ tutor });
  } catch (err: any) {
    const statusCode = err.message.includes('Invalid tutor ID') ? 400 : 500;
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

export const getAllProfiles = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const tutors = await getAllTutors();
    res.status(200).json({ 
      count: tutors.length,
      tutors 
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};