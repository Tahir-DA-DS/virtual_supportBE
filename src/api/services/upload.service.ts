import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Profile picture upload middleware
export const profilePictureUpload = upload.single('profilePicture');

// Helper function to get file URL
export const getFileUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filename: string): void => {
  const filePath = path.join('uploads', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper function to validate image dimensions
export const validateImageDimensions = (_filePath: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, _reject) => {
    // For now, return default dimensions
    // In production, you'd use a library like sharp or jimp to get actual dimensions
    resolve({ width: 400, height: 400 });
  });
};

// Helper function to get file info
export const getFileInfo = (file: Express.Multer.File) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    url: getFileUrl(file.filename)
  };
};
