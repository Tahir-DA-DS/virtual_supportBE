import { Tutor } from '../models/tutor.model';

export const createOrUpdateTutor = async (userId: string, data: any) => {
  return await Tutor.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, upsert: true }
  );
};

export const getTutorById = async (id: string) => {
  return await Tutor.findById(id);
};

export const getAllTutors = async () => {
  return await Tutor.find();
};
