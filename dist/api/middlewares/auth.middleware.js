"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authorizeRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;
const authenticate = (req, res, next) => {
    // Early return if JWT secret is not configured
    if (!JWT_SECRET || typeof JWT_SECRET !== 'string') {
        res.status(500).json({ message: 'JWT configuration error' });
        return;
    }
    const authHeader = req.headers.authorization;
    // Early return if authorization header is missing or malformed
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            message: 'Authorization token missing or malformed',
            required: 'Bearer <token>'
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    // Early return if token is missing
    if (!token) {
        res.status(401).json({ message: 'Token is missing' });
        return;
    }
    try {
        // At this point, JWT_SECRET is guaranteed to be a string
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Validate decoded token structure
        if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.role) {
            res.status(403).json({ message: 'Invalid token structure' });
            return;
        }
        // Ensure the decoded token has the required properties
        const userData = decoded;
        req.user = userData;
        next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired' });
        }
        else if (err.name === 'JsonWebTokenError') {
            res.status(403).json({ message: 'Invalid token' });
        }
        else {
            res.status(403).json({ message: 'Token verification failed' });
        }
    }
};
exports.authenticate = authenticate;
const authorizeRole = (role) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user || authReq.user.role !== role) {
            res.status(403).json({
                message: 'Forbidden: insufficient permissions',
                requiredRole: role,
                userRole: authReq.user?.role
            });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user || !roles.includes(authReq.user.role)) {
            res.status(403).json({
                message: 'Forbidden: insufficient permissions',
                requiredRoles: roles,
                userRole: authReq.user?.role
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=auth.middleware.js.map