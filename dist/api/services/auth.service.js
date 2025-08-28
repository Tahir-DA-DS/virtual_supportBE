"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const registerUser = async (name, email, password, role) => {
    // Validate input
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
        throw new Error('All fields are required');
    }
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
    }
    // Check if user already exists
    const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new Error('User already exists with this email');
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const user = new User_1.default({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role
    });
    await user.save();
    return user;
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    // Validate input
    if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required');
    }
    // Check JWT secret at runtime
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    const user = await User_1.default.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    const token = jsonwebtoken_1.default.sign({
        id: user._id,
        role: user.role,
        email: user.email
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return { token, user };
};
exports.loginUser = loginUser;
/**
 * Get user by ID
 * @param userId user's ID
 */
const getUserById = async (userId) => {
    try {
        const user = await User_1.default.findById(userId).select('-password');
        return user;
    }
    catch (error) {
        console.error('Error fetching user by ID:', error);
        return null;
    }
};
exports.getUserById = getUserById;
//# sourceMappingURL=auth.service.js.map