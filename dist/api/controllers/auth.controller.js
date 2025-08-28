"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const register = async (req, res) => {
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
        const user = await (0, auth_service_1.registerUser)(name, email, password, role);
        // Generate token for the new user
        const { token } = await (0, auth_service_1.loginUser)(email, password);
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
    }
    catch (err) {
        const statusCode = err.message.includes('already exists') ? 409 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email?.trim() || !password?.trim()) {
            res.status(400).json({
                message: 'Email and password are required',
                required: ['email', 'password']
            });
            return;
        }
        const { token, user } = await (0, auth_service_1.loginUser)(email, password);
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
    }
    catch (err) {
        res.status(401).json({
            message: err.message || 'Invalid credentials'
        });
    }
};
exports.login = login;
const logout = async (_req, res) => {
    try {
        // Logout endpoint for logging purposes
        // JWT tokens are stateless, so we just log the logout action
        res.status(200).json({
            message: 'Logout successful'
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'Server error during logout'
        });
    }
};
exports.logout = logout;
const getCurrentUser = async (req, res) => {
    try {
        // Extract user ID from the authenticated request
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                message: 'Unauthorized - No user ID found'
            });
            return;
        }
        const user = await (0, auth_service_1.getUserById)(userId);
        if (!user) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture || '',
            bio: user.bio || '',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'Server error while fetching user profile'
        });
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=auth.controller.js.map