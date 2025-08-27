import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import User from '../models/User';
import { getFileInfo, deleteFile } from '../services/upload.service';

/**
 * Update user profile picture
 */
export const updateProfilePicture = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'Profile picture file is required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      const oldFilename = user.profilePicture.split('/').pop();
      if (oldFilename) {
        deleteFile(oldFilename);
      }
    }

    // Get file info and update user
    const fileInfo = getFileInfo(req.file);
    user.profilePicture = fileInfo.url;
    await user.save();

    res.status(200).json({
      message: 'Profile picture updated successfully',
      profilePicture: fileInfo.url,
      fileInfo
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const allowedFields = [
      'name', 'bio', 'phone', 'dateOfBirth', 'location', 'timezone',
      'skills', 'certifications', 'education', 'preferences'
    ];

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Delete profile picture
 */
export const deleteProfilePicture = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.profilePicture) {
      res.status(400).json({ message: 'No profile picture to delete' });
      return;
    }

    // Delete file from storage
    const filename = user.profilePicture.split('/').pop();
    if (filename) {
      deleteFile(filename);
    }

    // Remove profile picture URL from user
    user.profilePicture = undefined;
    await user.save();

    res.status(200).json({
      message: 'Profile picture deleted successfully'
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};
