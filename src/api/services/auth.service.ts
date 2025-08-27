import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

// Get environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Register a new user
 * @param name user's name
 * @param email user's email
 * @param password plain text password
 * @param role 'student' | 'tutor'
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: 'student' | 'tutor'
): Promise<IUser> => {
  // Validate input
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    throw new Error('All fields are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role
  });

  await user.save();
  return user;
};

export const loginUser = async (email: string, password: string): Promise<string> => {
  // Validate input
  if (!email?.trim() || !password?.trim()) {
    throw new Error('Email and password are required');
  }

  // Check JWT secret at runtime
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      email: user.email 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  return token;
};
