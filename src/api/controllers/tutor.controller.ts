import { Request, Response } from 'express';
import TutorService from '../services/tutor.service';

export const createTutorProfile = async (req:Request, res:Response) => {
  const profile = await TutorService.create(req.user.id, req.body);
  res.status(201).json(profile);
};

export const getTutorProfile = async (req:Request, res:Response) => {
  const profile = await TutorService.getByUserId(req.user.id);
  res.status(200).json(profile);
};