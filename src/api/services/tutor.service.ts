import Tutor from '../models/tutor.model';

const create = async (userId:string, profileData:{}) => {
  const exists = await Tutor.findOne({ user: userId });
  if (exists) throw new Error('Tutor profile already exists');

  return await Tutor.create({
    user: userId,
    ...profileData
  });
};

const getByUserId = async (userId:string) => {
  return await Tutor.findOne({ user: userId }).populate('user');
};

export default { create, getByUserId };