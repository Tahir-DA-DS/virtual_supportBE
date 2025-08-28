import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
      res.status(400).json({ 
        message: 'All fields are required',
        required: ['name', 'email', 'password', 'role']
      });
      return;
    }

    if (!['student', 'tutor'].includes(role)) {
      res.status(400).json({ 
        message: 'Invalid role. Must be student or tutor',
        allowedRoles: ['student', 'tutor']
      });
      return;
    }

    const user = await registerUser(name, email, password, role as 'student' | 'tutor');
    
    // Generate token for the new user
    const { token } = await loginUser(email, password);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err: any) {
    const statusCode = err.message.includes('already exists') ? 409 : 500;
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      res.status(400).json({ 
        message: 'Email and password are required',
        required: ['email', 'password']
      });
      return;
    }

    const { token, user } = await loginUser(email, password);

    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || '',
        bio: user.bio || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err: any) {
    res.status(401).json({ 
      message: err.message || 'Invalid credentials' 
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Logout endpoint for logging purposes
    // JWT tokens are stateless, so we just log the logout action
    res.status(200).json({ 
      message: 'Logout successful' 
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: 'Server error during logout' 
    });
  }
};