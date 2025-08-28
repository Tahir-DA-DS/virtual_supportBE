"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfilePicture = exports.updateUserProfile = exports.getUserProfile = exports.updateProfilePicture = void 0;
const User_1 = __importDefault(require("../models/User"));
const upload_service_1 = require("../services/upload.service");
/**
 * Update user profile picture
 */
const updateProfilePicture = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: 'Profile picture file is required' });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Delete old profile picture if it exists
        if (user.profilePicture) {
            const oldFilename = user.profilePicture.split('/').pop();
            if (oldFilename) {
                (0, upload_service_1.deleteFile)(oldFilename);
            }
        }
        // Get file info and update user
        const fileInfo = (0, upload_service_1.getFileInfo)(req.file);
        user.profilePicture = fileInfo.url;
        await user.save();
        res.status(200).json({
            message: 'Profile picture updated successfully',
            profilePicture: fileInfo.url,
            fileInfo
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.updateProfilePicture = updateProfilePicture;
/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const user = await User_1.default.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getUserProfile = getUserProfile;
/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const allowedFields = [
            'name', 'bio', 'phone', 'dateOfBirth', 'location', 'timezone',
            'skills', 'certifications', 'education', 'preferences'
        ];
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        const user = await User_1.default.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            message: 'Profile updated successfully',
            user
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.updateUserProfile = updateUserProfile;
/**
 * Delete profile picture
 */
const deleteProfilePicture = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const user = await User_1.default.findById(userId);
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
            (0, upload_service_1.deleteFile)(filename);
        }
        // Remove profile picture URL from user
        user.profilePicture = undefined;
        await user.save();
        res.status(200).json({
            message: 'Profile picture deleted successfully'
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.deleteProfilePicture = deleteProfilePicture;
//# sourceMappingURL=user.controller.js.map