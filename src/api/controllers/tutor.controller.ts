import { Request, Response } from 'express';
import {
  createOrUpdateTutor,
  getTutorById,
  getAllTutors
} from '../services/tutor.service';

export const createOrUpdateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId; // or req.userId from jwt
    const data = req.body;

    const tutor = await createOrUpdateTutor(userId, data);
    res.status(200).json({ tutor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getProfile = async (req: Request, res: Response):Promise<void>=> {
  try {
    const tutor = await getTutorById(req.params.id);
    if (!tutor) res.status(404).json({ message: 'Tutor not found' });
    res.status(200).json({ tutor });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllProfiles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tutors = await getAllTutors();
    res.status(200).json({ tutors });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};