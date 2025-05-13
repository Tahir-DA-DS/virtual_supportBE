import User from '../models/User';
import bcrypt from 'bcryptjs';

export const registerUser = async (userData: { name: string; email: string; password: string, role:string })=>{
    const { name, email, password, role } = userData;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    return await user.save()
}

export const loginUser = async(email: string, password: string)=>{
    const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  return user;
}