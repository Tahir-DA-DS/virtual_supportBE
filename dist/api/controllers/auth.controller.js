"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
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
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
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
        const token = await (0, auth_service_1.loginUser)(email, password);
        res.status(200).json({
            message: 'Login successful',
            token
        });
    }
    catch (err) {
        res.status(401).json({
            message: err.message || 'Invalid credentials'
        });
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map