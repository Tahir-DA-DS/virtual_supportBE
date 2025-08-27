import Tutor, { ITutor } from '../models/tutor.model';
import User from '../models/User';

export interface TutorData {
  name?: string;
  email?: string;
  bio?: string;
  subjects?: string[];
  availability?: string[];
  profileImage?: string;
  experience?: number;
}

export const createOrUpdateTutor = async (userId: string, data: TutorData): Promise<ITutor> => {
  // Verify user exists and is a tutor
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (user.role !== 'tutor') {
    throw new Error('User is not a tutor');
  }

  // Include user data if not provided
  const tutorData = {
    ...data,
    userId,
    name: data.name || user.name,
    email: data.email || user.email
  };

  return await Tutor.findOneAndUpdate(
    { userId },
    { $set: tutorData },
    { new: true, upsert: true, runValidators: true }
  );
};

export const getTutorById = async (id: string): Promise<ITutor | null> => {
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('Invalid tutor ID format');
  }
  return await Tutor.findById(id).populate('userId', 'name email role');
};

export const getAllTutors = async (): Promise<ITutor[]> => {
  return await Tutor.find().populate('userId', 'name email role');
};